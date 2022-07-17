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
  });

  afterEach(async () => await driver.deleteSession());
});
