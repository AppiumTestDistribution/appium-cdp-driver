#!/usr/bin/env node

import { AndroidUiautomator2Driver } from 'appium-uiautomator2-driver';
import { ADB } from 'appium-adb';
import { resolveAdbPort } from '../src/adb.js';
import log from '../src/logger.js';
import { waitForCondition } from 'asyncbox';
import { finishSession } from './browserReady.js';

const START_APP_WAIT_DURATION = 60000;

const brave = {
  pkg: 'com.brave.browser',
  activity: 'com.google.android.apps.chrome.Main',
};

const common = {
  waitDuration: START_APP_WAIT_DURATION,
  optionalIntentArguments: '-d www.appium.io',
};

async function skipWelcomeBrave() {
  const adbPort = resolveAdbPort();
  const adb = await ADB.createADB({ adbPort });
  await adb.adbExec(['shell', 'pm', 'clear', 'com.brave.browser']);
  // Optional: suppress Chromium's first-run experience. Off by default because
  // /data/local/tmp/chrome-command-line is shared with Chrome and chromedriver,
  // which writes its own chromeOptions.args there — clobbering it would change
  // an unrelated Chrome session on the same device. Set CDP_SUPPRESS_FIRST_RUN=1
  // to opt in; without it the readiness pass dismisses onboarding instead.
  if (process.env.CDP_SUPPRESS_FIRST_RUN === '1') {
    await adb.adbExec([
      'shell',
      "echo '_ --disable-fre --no-first-run' > /data/local/tmp/chrome-command-line",
    ]);
  }
  const driver = new AndroidUiautomator2Driver();
  const caps = {
    platformName: "Android",
    "appium:automationName": "UiAutomator2",
    "appium:adbPort": adbPort,
    "appium:deviceName": "Android Device",
    "appium:appPackage": "com.brave.browser",
    "appium:appActivity": "com.google.android.apps.chrome.Main",
  };
  try {
    await driver.createSession(null, {
      alwaysMatch: caps,
      firstMatch: [{}],
    });
    const activity = await driver.getCurrentActivity();
    log.info(`Activity is ${activity}`);
    if (activity.includes('Welcome')) {
      const findElementWithWaitForCondition = async (
        strategy,
        selector,
        timeout = 20000
      ) => {
        try {
          return await waitForCondition(
            async () => {
              try {
                log.info(
                  `Attempting to find element (${strategy}: ${selector})`
                );
                const element = await driver.findElement(strategy, selector);
                log.info(
                  `Successfully found element (${strategy}: ${selector})`
                );
                return element;
              } catch (error) {
                // Return false to continue waiting
                return false;
              }
            },
            {
              waitMs: timeout,
              intervalMs: 1000,
            }
          );
        } catch (error) {
          throw new Error(
            `Failed to find element (${strategy}: ${selector}) within ${timeout}ms timeout: ${error.message}`
          );
        }
      };

      const cancelButton = await findElementWithWaitForCondition(
        'id',
        'android:id/button2'
      );
      log.info(`Cancel button is ${JSON.stringify(cancelButton, null, 2)}`);
      await driver.click(cancelButton.ELEMENT);

      try {
        await findElementWithWaitForCondition(
          'xpath',
          '//android.widget.TextView[@text="Allow Brave to send you notifications?"]'
        );

        const allowButton = await findElementWithWaitForCondition(
          'id',
          'com.android.permissioncontroller:id/permission_allow_button'
        );
        await driver.click(allowButton.ELEMENT);
      } catch (error) {
        log.info(`Help make Brave better text not found, skipping`);
      }

      const laterButton = await findElementWithWaitForCondition(
        'id',
        'com.brave.browser:id/btn_negative'
      );
      await driver.click(laterButton.ELEMENT);
      await findElementWithWaitForCondition(
        'xpath',
        '//android.widget.TextView[@text="Help make Brave better."]'
      );
      const continueButton = await findElementWithWaitForCondition(
        'id',
        'com.brave.browser:id/btn_positive'
      );
      await driver.click(continueButton.ELEMENT);
    }
  } catch (error) {
    log.info(`walkthrough did not complete (${error.message}) — checking readiness anyway`);
  } finally {
    await finishSession(driver, { adb, pkg: brave.pkg, component: `${brave.pkg}/${brave.activity}`, socket: 'chrome_devtools_remote' });
  }
}

(async () => {
  await skipWelcomeBrave();
  process.exit(0);
})();
