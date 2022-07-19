const CDP = require("chrome-remote-interface");
const { openBrowser, goto, closeBrowser } = require("taiko");
const fetch = require("node-fetch");
async function example() {
  let client;
  try {
    // connect to endpoint
    // client = await CDP({
    //   host: "127.0.0.1",
    //   port: 9241,
    //   local: true,
    //   target: "ws://localhost:9241/devtools/page/1516",
    // });
    // await openBrowser({
    //   host: "127.0.0.1",
    //   port: 9241,
    //   target: "ws://localhost:9241/devtools/page/1515",
    // });
    // await goto('github.com');
    // await closeBrowser();
    // extract domains

    const targets = await fetch(`http://localhost:9241/json/list`);
    const data = await targets.json();
    const target = data.find((target) => {
      return target.url === "http://appium.io/";
    });
    console.log(target);
  } catch (err) {
    console.error(err);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

example();
