import { ADB, getSdkRootFromEnv } from 'appium-adb';
import { fs } from '@appium/support';
import getPort from 'get-port';
import { AndroidUiautomator2Driver } from 'appium-uiautomator2-driver';
import log from './logger';

let adb;
const START_APP_WAIT_DURATION = 60000;

const DEVTOOLS_SOCKET_MAP = {
  chrome: 'chrome_devtools_remote',
  brave: 'chrome_devtools_remote',
  opera: 'com.opera.browser.devtools',
  terrance: 'com.sec.android.app.sbrowser_devtools_remote',
};

export async function getAdb() {
  try {
    if (!adb) {
      adb = await ADB.createADB();
    }
  } catch (e) {
    console.log(e);
  }
}

export async function requireSdkRoot() {
  const sdkRoot = getSdkRootFromEnv();
  const docMsg =
    'Read https://developer.android.com/studio/command-line/variables for more details';
  if (_.isEmpty(sdkRoot)) {
    throw new Error(
      `Neither ANDROID_HOME nor ANDROID_SDK_ROOT environment variable was exported. ${docMsg}`
    );
  }

  if (!(await fs.exists(sdkRoot))) {
    throw new Error(
      `The Android SDK root folder '${sdkRoot}' does not exist on the local file system. ${docMsg}`
    );
  }
  const stats = await fs.stat(sdkRoot);
  if (!stats.isDirectory()) {
    throw new Error(
      `The Android SDK root '${sdkRoot}' must be a folder. ${docMsg}`
    );
  }
  return sdkRoot;
}

export async function adbExec(browser = 'chrome') {
  let freePort = await getPort();
  const devtoolsSocket =
    DEVTOOLS_SOCKET_MAP[browser] || `${browser}_devtools_remote`;
  await adb.adbExec([
    'forward',
    `tcp:${freePort}`,
    `localabstract:${devtoolsSocket}`,
  ]);
  return freePort;
}

export async function startApplication(browser = 'chrome') {
  const common = {
    waitDuration: START_APP_WAIT_DURATION,
    optionalIntentArguments: '-d www.appium.io',
  };
  const chrome = {
    pkg: 'com.android.chrome',
    activity: 'com.google.android.apps.chrome.Main',
  };

  const terrance = {
    pkg: 'com.sec.android.app.sbrowser',
    activity: 'com.sec.android.app.sbrowser.SBrowserMainActivity',
  };

  const brave = {
    pkg: 'com.brave.browser',
    activity: 'com.google.android.apps.chrome.Main',
  };

  const opera = {
    pkg: 'com.opera.browser',
    activity: 'com.opera.android.BrowserActivity',
  };

  if (browser === 'chrome') {
    await adb.startApp(Object.assign({}, chrome, common));
  } else if (browser === 'terrance') {
    await adb.startApp(Object.assign({}, terrance, common));
  } else if (browser === 'brave') {
    await adb.startApp(Object.assign({}, brave, common));
  } else if (browser === 'opera') {
    await adb.adbExec(['shell', 'pm', 'clear', 'com.opera.browser']);
    await adb.startApp(Object.assign({}, opera, common));
    const driver = new AndroidUiautomator2Driver();
    const caps = {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Android Device',
    };
    await driver.createSession(null, {
      alwaysMatch: caps,
      firstMatch: [{}],
    });
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const activity = await driver.getCurrentActivity();
    log.info(`Activity is ${activity}`);
    if (activity.includes('Welcome')) {
      // Helper function to find element with retry logic
      const findElementWithRetry = async (
        strategy,
        selector,
        maxRetries = 5
      ) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            log.info(
              `Attempting to find element (${strategy}: ${selector}) - Attempt ${attempt}/${maxRetries}`
            );
            const element = await driver.findElement(strategy, selector);
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second after finding element
            log.info(
              `Successfully found element (${strategy}: ${selector}) on attempt ${attempt}`
            );
            return element;
          } catch (error) {
            log.info(
              `Failed to find element (${strategy}: ${selector}) on attempt ${attempt}: ${error.message}`
            );
            if (attempt === maxRetries) {
              throw new Error(
                `Failed to find element (${strategy}: ${selector}) after ${maxRetries} attempts: ${error.message}`
              );
            }
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      };

      const nextButton = await findElementWithRetry(
        'id',
        'com.opera.browser:id/continue_button'
      );
      log.info(`Next button is ${JSON.stringify(nextButton, null, 2)}`);
      await driver.click(nextButton.ELEMENT);

      const skipButton = await findElementWithRetry(
        'id',
        'com.opera.browser:id/skip_button'
      );
      await driver.click(skipButton.ELEMENT);

      const skipAgainButton = await findElementWithRetry(
        'id',
        'com.opera.browser:id/skip_button'
      );
      await driver.click(skipAgainButton.ELEMENT);

      const allowButton = await findElementWithRetry(
        'xpath',
        '//android.widget.Button[@text="Allow"]'
      );
      await driver.click(allowButton.ELEMENT);
    }
  }
}
