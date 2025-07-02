import { BaseDriver, errors } from '@appium/base-driver';
import { getAdb, adbExec, startApplication } from './adb';
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
    };
  }

  async createSession(jwpCaps, reqCaps, w3cCaps, otherDriverData) {
    console.log(await getConfig('local'));
    const res = await super.createSession(w3cCaps);
    const browser = w3cCaps.alwaysMatch['browserName'];
    await getAdb();
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
    const target = data.find((target) => {
      return target.url.includes('appium.io');
    });
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
