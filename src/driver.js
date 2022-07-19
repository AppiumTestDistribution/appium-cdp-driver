import { BaseDriver, errors } from "@appium/base-driver";
import { getAdb, adbExec, startApplication } from "./adb";
import { openBrowser, getConfig } from 'taiko';
import commands from './commands'
import CDP from 'chrome-remote-interface';
process.env.LOCAL_PROTOCOL = true;
class AppiumCDPDriver extends BaseDriver {
  constructor(args) {
    super(args);
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
    console.log(await getConfig("local"));
    const res = await super.createSession(w3cCaps);
    const browser = w3cCaps.alwaysMatch["appium:browserName"];
    await getAdb();
    const port = await adbExec(browser);
    await startApplication(browser);
    log.info('Browser opened')
    const targets = await CDP.List({ port });
    const target = targets.find((target) => {
      return target.url === "http://appium.io/";
    });
    console.log(target);
    //await openBrowser({ port: port, host: '127.0.0.1', target: '' });
    return res;
  }

  async deleteSession() {
    await super.deleteSession();
  }
}

Object.assign(AppiumCDPDriver.prototype, commands);
export { AppiumCDPDriver, createSession };
export default AppiumCDPDriver;
