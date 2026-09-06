import fetch from 'node-fetch';
import getPort from 'get-port';
import log from '../src/logger.js';

/**
 * Shared readiness helper for the skip-welcome-* scripts.
 *
 * The scripts clear the browser profile and then click through first-run
 * onboarding. That choreography is inherently racy: dialog order and content
 * vary per launch, some stages are conditional, and an Android system dialog
 * (e.g. "System UI isn't responding") can cover the screen entirely. When it
 * goes wrong the browser never opens its devtools socket and session creation
 * fails later with "socket hang up" or "Debug list is empty or invalid".
 *
 * Instead of requiring a fixed sequence, converge on the end state the driver
 * actually needs: the browser's own devtools socket, with onboarding gone and a
 * page open. Dismiss whatever happens to be on screen, relaunch when stuck, and
 * report honestly if it never becomes ready.
 */

const ONBOARDING_ACTIVITY = /Welcome|FirstRun|firstrun|Onboarding|HelpIntro/i;

// Safe to click on first-run and system dialogs, in priority order. "Wait" is
// first so an ANR dialog is cleared before anything underneath it is touched.
const COMMON_SELECTORS = [
  '//android.widget.Button[@text="Wait"]',
  '//android.widget.Button[@text="OK"]',
  '//android.widget.Button[@text="Continue"]',
  '//android.widget.Button[@text="Next"]',
  '//android.widget.Button[@text="Skip"]',
  '//android.widget.Button[@text="Not now"]',
  '//android.widget.Button[@text="Allow"]',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Targets the driver can actually attach to. Workers also carry a
 * webSocketDebuggerUrl, so filtering on that field alone would accept a browser
 * that has no page open — the state this check exists to reject.
 */
export function pickPageTargets(targets) {
  return (Array.isArray(targets) ? targets : []).filter(
    (t) => t && t.type === 'page' && t.webSocketDebuggerUrl
  );
}

/**
 * Resolve the devtools socket name, or null if the browser has not opened it.
 * WebView-based browsers expose webview_devtools_remote_<pid>; the bare prefix
 * also matches other apps' WebViews, so scope it to this package's pid.
 */
async function resolveSocket(adb, socket, pkg, pidScoped) {
  const unix = String(await adb.adbExec(['shell', 'cat', '/proc/net/unix']));
  if (!pidScoped) {
    // Several browsers share a socket name (chrome, brave and edge all use
    // chrome_devtools_remote). Abstract names are unique per owner, so seeing
    // the name proves *someone* opened it, not that we did — verifyReady()
    // confirms ownership before trusting it.
    return unix.includes(socket) ? socket : null;
  }
  const pid = await browserPid(adb, pkg);
  if (!pid) {
    return null;
  }
  const scoped = `${socket}_${pid}`;
  return unix.includes(scoped) ? scoped : null;
}

/**
 * First pid of the package. pidof returns a space-separated list when the app
 * has several processes, and only the first is the browser process whose
 * WebView socket we want.
 */
export async function browserPid(adb, pkg) {
  const output = String(await adb.adbExec(['shell', 'pidof', pkg])).trim();
  return output ? output.split(/\s+/)[0] : null;
}

async function getJson(port, path) {
  const response = await fetch(`http://localhost:${port}${path}`);
  return response.json();
}

/**
 * Confirm the devtools endpoint belongs to the browser we are setting up.
 * Chrome for Android reports the owning package in /json/version, which
 * disambiguates the shared chrome_devtools_remote name.
 */
async function ownedByPackage(port, pkg) {
  try {
    const version = await getJson(port, '/json/version');
    const owner = version['Android-Package'];
    if (!owner) {
      return true; // endpoint does not report an owner; nothing to contradict
    }
    if (owner !== pkg) {
      log.info(`ensureBrowserReady: devtools socket belongs to ${owner}, not ${pkg}`);
      return false;
    }
  } catch (e) {
    log.info(`ensureBrowserReady: /json/version check failed: ${e.message}`);
  }
  return true;
}

/**
 * Ask /json/list the way the driver does. The socket can be up while the
 * browser has no page — that is the "Debug list is empty or invalid" failure —
 * so an attachable *page* is the only meaningful proof of readiness. Workers
 * also carry a webSocketDebuggerUrl and must not be mistaken for one.
 */
async function verifyReady(adb, socketName, pkg, timeoutMs = 5000, intervalMs = 500) {
  const port = await getPort();
  try {
    await adb.adbExec(['forward', `tcp:${port}`, `localabstract:${socketName}`]);
    if (!(await ownedByPackage(port, pkg))) {
      return false;
    }
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      let pages = [];
      let total = -1;
      try {
        const targets = await getJson(port, '/json/list');
        if (Array.isArray(targets)) {
          total = targets.length;
          pages = pickPageTargets(targets);
        }
      } catch (e) {
        log.info(`ensureBrowserReady: /json/list check failed: ${e.message}`);
      }
      if (pages.length > 0) {
        log.info(`ensureBrowserReady: ${pkg} has ${pages.length} page target(s) of ${total}`);
        return true;
      }
      if (Date.now() >= deadline) {
        log.info(`ensureBrowserReady: ${pkg} has no page target (targets=${total})`);
        return false;
      }
      await sleep(intervalMs);
    }
  } catch (error) {
    log.info(`ensureBrowserReady: readiness check failed: ${error.message}`);
    return false;
  } finally {
    try {
      await adb.adbExec(['forward', '--remove', `tcp:${port}`]);
    } catch (e) {
      // the forward may already be gone
    }
  }
}

async function currentActivity(driver) {
  try {
    return String(await driver.getCurrentActivity());
  } catch (e) {
    return '';
  }
}

async function openPage(adb, pkg, component, url) {
  // target the component: a bare trailing package is not honoured by am, and the
  // intent would open in whichever browser handles VIEW by default
  const target = component || pkg;
  await adb.adbExec([
    'shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', url, '-n', target,
  ]);
}

/**
 * @param {object} opts
 * @param {object} opts.driver     UiAutomator2 driver used for the walkthrough
 * @param {object} opts.adb        appium-adb instance
 * @param {string} opts.pkg        browser package name
 * @param {string} opts.socket     devtools socket name (see DEVTOOLS_SOCKET_MAP)
 * @param {string} [opts.component] pkg/activity used to open a page in this browser
 * @param {boolean} [opts.pidScoped]  socket name is suffixed with the pid (WebView apps)
 * @param {string[]} [opts.selectors] browser-specific selectors, tried before the common ones
 * @param {string} [opts.url]      page to open once the socket is up
 * @param {number} [opts.attempts]
 * @returns {Promise<boolean>} whether the browser became ready
 */
export async function ensureBrowserReady(opts) {
  const {
    driver, adb, pkg, socket,
    component,
    pidScoped = false,
    selectors = [],
    url = 'https://www.appium.io',
    attempts = 12,
    intervalMs = 2500,
  } = opts;
  const candidates = [...selectors, ...COMMON_SELECTORS];

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      // The process (and its socket) can exist while onboarding is still on
      // screen, and even afterwards the browser may hold no debuggable page.
      // Require onboarding gone, the socket up, and a page the driver can attach to.
      const activity = await currentActivity(driver);
      if (ONBOARDING_ACTIVITY.test(activity)) {
        log.info(`ensureBrowserReady: still on onboarding (${activity})`);
      } else {
        const socketName = await resolveSocket(adb, socket, pkg, pidScoped);
        if (socketName) {
          await openPage(adb, pkg, component, url);
          // poll rather than sleeping a fixed interval: usually the page is
          // there within a few hundred ms, and setup should not pay for the
          // worst case on every session
          if (await verifyReady(adb, socketName, pkg)) {
            return true;
          }
        }
      }
    } catch (e) {
      // fall through to the dismissal pass
    }

    let clicked = null;
    for (const selector of candidates) {
      try {
        const element = await driver.findElement('xpath', selector);
        await driver.click(element.ELEMENT);
        clicked = selector;
        break;
      } catch (e) {
        // selector not present — try the next one
      }
    }

    if (clicked) {
      log.info(`ensureBrowserReady: dismissed ${clicked}`);
    } else if (attempt % 3 === 2) {
      log.info(`ensureBrowserReady: nothing to dismiss, relaunching ${pkg}`);
      try {
        await openPage(adb, pkg, component, url);
      } catch (e) {
        // browser may still be starting
      }
    }
    await sleep(intervalMs);
  }
  return false;
}

/**
 * Click an element without letting a stale/handled element abort the rest of the
 * walkthrough — the screen often changes under it.
 */
export async function clickSafely(driver, element) {
  try {
    await driver.click(element.ELEMENT);
  } catch (error) {
    log.info(`click failed, continuing: ${error.message}`);
  }
}

/**
 * Close out a skip-welcome script: make the browser ready, always release the
 * UiAutomator2 session, and fail loudly if the browser cannot serve a session.
 * Without the throw, a script that dismissed nothing still exits 0 and the
 * caller starts a session that is doomed to fail.
 */
export async function finishSession(driver, opts) {
  const ready = await ensureBrowserReady({ driver, ...opts });
  log.info(`${opts.pkg} devtools ready: ${ready}`);
  try {
    await driver.deleteSession();
  } catch (e) {
    log.info(`deleteSession failed: ${e.message}`);
  }
  if (!ready) {
    throw new Error(`${opts.pkg}: devtools socket never became available; the browser cannot serve a session`);
  }
}
