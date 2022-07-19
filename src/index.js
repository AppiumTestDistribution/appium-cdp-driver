const CDP = require("chrome-remote-interface");
const { openBrowser, goto, closeBrowser } = require("taiko");
async function example() {
  let client;
  try {
    // connect to endpoint
    client = await CDP({
      host: "127.0.0.1",
      port: 9241,
      local: true,
      target: "ws://localhost:9241/devtools/page/1516",
    });
    // await openBrowser({
    //   host: "127.0.0.1",
    //   port: 9241,
    //   target: "ws://localhost:9241/devtools/page/1515",
    // });
    // await goto('github.com');
    // await closeBrowser();
    // extract domains
    const { Network, Page } = client;
    // setup handlers
    Network.requestWillBeSent((params) => {
      console.log(params.request.url);
    });
    // enable events then start!
    await Network.enable();
    await Page.enable();
    await Page.navigate({ url: "https://github.com" });
    await Page.loadEventFired();
  } catch (err) {
    console.error(err);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

example();
