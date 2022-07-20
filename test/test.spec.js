import { remote } from "webdriverio";
import { WDIO_PARAMS, androidCapabilities } from "./wdio.config";

let driver;
describe("Plugin Test", () => {
  beforeEach(async () => {
    driver = await remote({
      ...WDIO_PARAMS,
      capabilities: androidCapabilities,
    });
  });

  it("Vertical swipe test", async () => {
    await driver.url("https://github.com/");
    const url = await driver.getUrl();
    console.log(url);
    const element = await driver.$("//*[contains(text(),'Email')]");
    await element.click();
  });

  afterEach(async () => await driver.deleteSession());
});
