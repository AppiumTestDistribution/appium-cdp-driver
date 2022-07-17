import { BaseDriver, errors } from "@appium/base-driver";
import log from './logger';

class AppiumCDPDriver extends BaseDriver {
  constructor(args) {
    super(args);
    this.shouldValidateCaps = false;
  }
  async createSession(...args) {
    const res= await super.createSession(...args);
    log.info("Inside CDP Driver create session");
    return res;
  }

  async deleteSession() {
    // do your own cleanup here
    // don't forget to call super!
    await super.deleteSession();
  }
}

export { AppiumCDPDriver };
export default AppiumCDPDriver;
