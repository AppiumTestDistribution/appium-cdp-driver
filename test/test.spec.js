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

  it('Cookies test', async () => {
    await driver.url("https://the-internet.herokuapp.com");

    await driver.setCookies({name: 'myCookie', value: 'some content'});

    let allCookies = await driver.getCookies();
    expect(allCookies).to.be.not.null;
    let myCookie = allCookies.filter( (cookie) => { return cookie.name === 'myCookie' })[0];
    expect(myCookie).to.be.not.null;
    await driver.deleteCookie('myCookie');

    allCookies = await driver.getCookies();
    myCookie = allCookies.filter( (cookie) => { return cookie.name === 'myCookie' })[0];
    expect(myCookie).to.be.undefined;

    await driver.deleteCookies();
    allCookies = await driver.getCookies();
    console.log(`all cookies = ${JSON.stringify(allCookies)}`)
    expect(allCookies).to.eql([]);
  })

  afterEach(async () => await driver.deleteSession());
});
