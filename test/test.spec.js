import { remote } from "webdriverio";
import { WDIO_PARAMS, androidCapabilities } from "./wdio.config";
import chai from 'chai';
const expect = chai.expect;

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
    const element = await driver.$("id=user_email");
    await element.setValue("test123");
    const title = await driver.getTitle();
    expect(title).to.eq('GitHub: Where the world builds software · GitHub');
  });

  it('get Page source', async () =>{
    await driver.url("https://github.com/");
    const pageSource = await driver.getPageSource();
    expect(pageSource).to.be.not.empty;
  })

  afterEach(async () => await driver.deleteSession());
});
