import { ADB, getSdkRootFromEnv } from 'appium-adb';
import { fs } from '@appium/support';
import getPort from 'get-port';
import log from './logger';

let adb;
const START_APP_WAIT_DURATION = 60000;

const DEVTOOLS_SOCKET_MAP = {
  chrome: 'chrome_devtools_remote',
  brave: 'chrome_devtools_remote',
  opera: 'com.opera.browser.devtools',
  duckduckgo: 'webview_devtools_remote',
  samsung: 'Terrace_devtools_remote',
  edge: 'chrome_devtools_remote',
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
  let devtoolsSocket =
    DEVTOOLS_SOCKET_MAP[browser] || `${browser}_devtools_remote`;

  if (browser === 'duckduckgo') {
    const pid = await getDuckDuckGoPid(browser);
    if (pid) {
      devtoolsSocket = `webview_devtools_remote_${pid}`;
    } else {
      throw new Error(`Unable to get PID for ${browser}`);
    }
  }

  await adb.adbExec([
    'forward',
    `tcp:${freePort}`,
    `localabstract:${devtoolsSocket}`,
  ]);
  return freePort;
}
 
async function getDuckDuckGoPid(browser = 'duckduckgo') {
  const packageName = 'com.duckduckgo.mobile.android';
  try {
    const output = await adb.adbExec(['shell', 'pidof', packageName]);
    const pid = output.trim();
    return pid || null;
  } catch (err) {
    console.error(`Unable to get PID for ${browser}:`, err.message);
    return null;
  }
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

  const duckduckgo = {
    pkg: 'com.duckduckgo.mobile.android',
    activity: 'com.duckduckgo.app.browser.BrowserActivity',
  };

  const samsung = {
    pkg: 'com.sec.android.app.sbrowser',
    activity: 'com.sec.android.app.sbrowser.SBrowserMainActivity',
  };
  
  const edge = {
    pkg: 'com.microsoft.emmx',
    activity: 'com.microsoft.ruby.Main',
  };

  if (browser === 'chrome') {
    log.info(`Starting Chrome`);
    await adb.startApp(Object.assign({}, chrome, common));
  } else if (browser === 'terrance') {
    log.info(`Starting Terrance`);
    await adb.startApp(Object.assign({}, terrance, common));
  } else if (browser === 'brave') {
    log.info(`Starting Brave`);
    await adb.startApp(Object.assign({}, brave, common));
  } else if (browser === 'opera') {
    log.info(`Starting Opera`);
    await adb.startApp(Object.assign({}, opera, common));
  } else if (browser === 'duckduckgo') {
    log.info(`Starting DuckDuckGo`);
    await adb.startApp(Object.assign({}, duckduckgo, common));
  } else if (browser === 'samsung') {
    log.info(`Starting Samsung Browser`);
    await adb.startApp(Object.assign({}, samsung, common));
  } else if (browser === 'edge') {
    log.info(`Starting MS Edge`);
    await adb.startApp(Object.assign({}, edge, common));
  }
}