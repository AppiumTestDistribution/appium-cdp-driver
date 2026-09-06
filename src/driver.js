import { BaseDriver, errors } from '@appium/base-driver';
import { getAdb, adbExec, startApplication, openStartUrl } from './adb';
import { openBrowser, getConfig, goto } from 'taiko';
import commands from './commands';
import log from './logger';
import fetch from 'node-fetch';
import retry from 'async-retry';
process.env.LOCAL_PROTOCOL = true;
class AppiumCDPDriver extends BaseDriver {
  constructor(args) {
    super(args);
    this.locatorStrategies = ['xpath', 'id'];
    this.desiredCapConstraints = {
      automationName: {
        presence: true,
        isString: true,
      },
      browserName: {
        presence: true,
        isString: true,
      },
      adbPort: {
        isNumber: false,
        presence: false,
      },
    };
  }

  async createSession(jwpCaps, reqCaps, w3cCaps, otherDriverData) {
    console.log(await getConfig('local'));
    const res = await super.createSession(w3cCaps);
    const browser = w3cCaps.alwaysMatch['browserName'];
    await getAdb(w3cCaps.alwaysMatch['appium:adbPort']);
    let port;
    if (browser === 'duckduckgo') {
      await startApplication(browser);
      port = await adbExec(browser);
    } else {
      port = await adbExec(browser);
      await startApplication(browser);
    }
    log.info('Browser opened');
    // Wait a bit longer for Opera to initialize its CDP interface
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await retry(
      async (bail) => {
        try {
          log.info(
            `Attempting to connect to CDP at http://localhost:${port}/json/list`
          );
          const res = await fetch(`http://localhost:${port}/json/list`);

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }

          const data = await res.json();
          log.info(`CDP response: ${JSON.stringify(data)}`);

          if (!Array.isArray(data) || data.length === 0) {
            // The socket is up but the browser holds no debuggable page — common
            // for WebView-based browsers just after launch. Retrying the fetch
            // alone changes nothing, so nudge the browser into opening one.
            log.info('Debug list is empty, opening the start URL to create a page');
            try {
              await openStartUrl(browser);
            } catch (launchError) {
              log.info(`Could not open the start URL: ${launchError.message}`);
            }
            throw new Error('Debug list is empty or invalid');
          }

          return data;
        } catch (error) {
          log.error(`CDP connection attempt failed: ${error.message}`);
          throw error;
        }
      },
      {
        retries: 10,
        factor: 2,
        minTimeout: 2000,
        maxTimeout: 10000,
      }
    );
    // Prefer the page we launched, but do not require it: after a redirect, a
    // new tab, or an onboarding page the list holds other targets, and reading
    // webSocketDebuggerUrl off undefined fails the session with an opaque error.
    let target = data.find((t) => t.url && t.url.includes('appium.io'));
    if (!target) {
      target =
        data.find((t) => t.type === 'page' && t.webSocketDebuggerUrl) ||
        data.find((t) => t.webSocketDebuggerUrl);
      log.info(`No appium.io target; falling back to ${target ? target.url || target.type : 'none'}`);
    }
    if (!target) {
      throw new Error(
        `No CDP target with a webSocketDebuggerUrl in ${JSON.stringify(data)}`
      );
    }
    log.info(`Target found: ${target.webSocketDebuggerUrl}`);
    await openBrowser({
      port: port,
      host: '127.0.0.1',
      target: target.webSocketDebuggerUrl,
    });
    return res;
  }

  async deleteSession() {
    await super.deleteSession();
  }
}

Object.assign(AppiumCDPDriver.prototype, commands);
export { AppiumCDPDriver };
