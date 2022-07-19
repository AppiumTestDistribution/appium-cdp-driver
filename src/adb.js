import { ADB, getSdkRootFromEnv } from "appium-adb";
import { fs } from "@appium/support";
import log from "./logger";
import getPort from "get-port";

let adb;
const START_APP_WAIT_DURATION = 60000;

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
    "Read https://developer.android.com/studio/command-line/variables for more details";
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

export async function adbExec(browser = "chrome") {
  let freePort = await getPort();
  await adb.adbExec([
    "forward",
    `tcp:${freePort}`,
    `localabstract:${browser}_devtools_remote`,
  ]);
  return freePort;
}

export async function startApplication(browser = 'chrome') {
  const common = {
    waitDuration: START_APP_WAIT_DURATION,
    optionalIntentArguments: "-d www.appium.io",
  };
  const chrome = {
    pkg: "com.android.chrome",
    activity: "com.google.android.apps.chrome.Main",
  };

  const terrance = {
    pkg: "com.sec.android.app.sbrowser",
    activity: "com.sec.android.app.sbrowser.SBrowserMainActivity",
  };
  if (browser === 'chrome') {
      await adb.startApp(Object.assign({}, chrome, common));
  } else {
    await adb.startApp(Object.assign({}, terrance, common));
  }
}
