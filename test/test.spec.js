import { remote } from 'webdriverio';
import { WDIO_PARAMS, androidCapabilities } from './wdio.config';
import chai from 'chai';
const expect = chai.expect;

let driver;
describe('Plugin Test', () => {
  beforeEach(async () => {
    driver = await remote({
      ...WDIO_PARAMS,
      capabilities: androidCapabilities,
    });
  });

  it('Sample test', async () => {
    await driver.url('https://github.com/');
    const url = await driver.getUrl();
    console.log(url);
    const element = await driver.$('id=hero_user_email');
    await element.setValue('test123');
    const title = await driver.getTitle();
    expect(title).to.eq(
      'GitHub · Build and ship software on a single, collaborative platform · GitHub'
    );
  });

  it('get Page source', async () => {
    await driver.url('https://github.com/');
    const pageSource = await driver.getPageSource();
    expect(pageSource).to.be.not.empty;
  });

  it('Cookies test', async () => {
    await driver.url('https://the-internet.herokuapp.com');

    await driver.setCookies({ name: 'myCookie', value: 'some content' });

    let allCookies = await driver.getCookies();
    expect(allCookies).to.be.not.null;
    let myCookie = allCookies.filter((cookie) => {
      return cookie.name === 'myCookie';
    })[0];
    expect(myCookie).to.be.not.null;
    await driver.deleteCookie('myCookie');

    allCookies = await driver.getCookies();
    myCookie = allCookies.filter((cookie) => {
      return cookie.name === 'myCookie';
    })[0];
    expect(myCookie).to.be.undefined;

    await driver.deleteCookies();
    allCookies = await driver.getCookies();
    console.log(`all cookies = ${JSON.stringify(allCookies)}`);
    expect(allCookies).to.eql([]);
  });

  it('Screenshot test', async () => {
    await driver.url('https://github.com/');
    const element = await driver.$('id=hero_user_email');
    await element.setValue('heman@h.com');
    const eleScreenshot = await element.saveScreenshot('./1.png');
    expect(eleScreenshot).to.be.not.null;
    const screenshot = await driver.saveScreenshot('./2.png');
    expect(screenshot).to.be.not.null;
  });

  afterEach(async () => await driver.deleteSession());
});
