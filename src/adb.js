import { ADB, DEFAULT_ADB_PORT, getSdkRootFromEnv } from 'appium-adb';
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

/**
 * Resolve the adb server port: explicit value wins, then CDP_ADB_PORT (used by
 * the skip-welcome scripts, which run as separate processes and receive no
 * capabilities), then adb's default.
 */
export function resolveAdbPort(adbPort) {
  const candidate = adbPort ?? process.env.CDP_ADB_PORT;
  const port = parseInt(candidate, 10);
  return Number.isInteger(port) && port > 0 ? port : DEFAULT_ADB_PORT;
}

export async function getAdb(adbPort) {
  try {
    if (!adb) {
      const port = resolveAdbPort(adbPort);
      log.info(`Using adb server port ${port}`);
      adb = await ADB.createADB({ adbPort: port });
    }
  } catch (e) {
    console.log(e);
  }
  return adb;
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
    // pidof lists every process of the package; the socket belongs to the first
    // (browser) process, and passing the whole list builds an unusable socket
    // name like webview_devtools_remote_1234 5678
    const pid = String(output).trim().split(/\s+/)[0];
    return pid || null;
  } catch (err) {
    console.error(`Unable to get PID for ${browser}:`, err.message);
    return null;
  }
}

const BROWSERS = {
  chrome: { pkg: 'com.android.chrome', activity: 'com.google.android.apps.chrome.Main' },
  brave: { pkg: 'com.brave.browser', activity: 'com.google.android.apps.chrome.Main' },
  opera: { pkg: 'com.opera.browser', activity: 'com.opera.android.BrowserActivity' },
  duckduckgo: { pkg: 'com.duckduckgo.mobile.android', activity: 'com.duckduckgo.app.browser.BrowserActivity' },
  samsung: { pkg: 'com.sec.android.app.sbrowser', activity: 'com.sec.android.app.sbrowser.SBrowserMainActivity' },
  terrance: { pkg: 'com.sec.android.app.sbrowser', activity: 'com.sec.android.app.sbrowser.SBrowserMainActivity' },
  edge: { pkg: 'com.microsoft.emmx', activity: 'com.microsoft.ruby.Main' },
};

/**
 * Open the start URL in an already-running browser.
 *
 * Deliberately a plain VIEW intent rather than startApplication: the latter
 * passes -S, which force-stops the process. That changes the pid, and for
 * WebView-based browsers the devtools socket name carries the pid, so an
 * existing port forward is left pointing at a socket that no longer exists.
 */
export async function openStartUrl(browser, url = 'https://www.appium.io') {
  const pkg = BROWSERS[browser]?.pkg;
  if (!pkg) {
    return;
  }
  // -n <component>: a bare trailing package is not honoured by am, so the intent
  // would go to whichever browser handles VIEW by default rather than this one
  await adb.adbExec([
    'shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', url,
    '-n', `${pkg}/${BROWSERS[browser].activity}`,
  ]);
}

export async function startApplication(browser = 'chrome') {
  const target = BROWSERS[browser];
  if (!target) {
    return;
  }
  log.info(`Starting ${browser}`);
  await adb.startApp({
    pkg: target.pkg,
    activity: target.activity,
    waitDuration: START_APP_WAIT_DURATION,
    optionalIntentArguments: '-d www.appium.io',
  });
}
