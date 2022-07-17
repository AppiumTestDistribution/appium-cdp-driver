const CDP = require("chrome-remote-interface");

async function example() {
  let client;
  try {
    // connect to endpoint
    client = await CDP({ local: true, port: 9225 });
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
