import { BaseDriver, errors } from "@appium/base-driver";
import { getAdb, adbExec, startApplication } from "./adb";
import { openBrowser, getConfig, goto } from "taiko";
import commands from "./commands";
import log from "./logger";
import fetch from "node-fetch";
import retry from "async-retry";
process.env.LOCAL_PROTOCOL = true;
class AppiumCDPDriver extends BaseDriver {
  constructor(args) {
    super(args);
    this.locatorStrategies = ["xpath", "id"];
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
    const browser = w3cCaps.alwaysMatch["browserName"];
    await getAdb();
    const port = await adbExec(browser);
    await startApplication(browser);
    log.info("Browser opened");
    const data = await retry(
      async (bail) => {
        const res = await await fetch(`http://localhost:${port}/json/list`);
        const data = await res.json();
        if (data.length == 0) {
          throw new Error('Debug list is empty');
        }
        return data;
      },
      {
        retries: 5,
        factor: 1,
      }
    );
    const target = data.find((target) => {
      return (target.url).includes("appium.io");
    });
    log.info(`Target found: ${target.webSocketDebuggerUrl}`);
    await openBrowser({
      port: port,
      host: "127.0.0.1",
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
