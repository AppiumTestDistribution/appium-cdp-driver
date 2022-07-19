import { goto, currentURL } from "taiko";

let commands = {},
  helpers = {},
  extensions = {};

commands.setUrl = async function setUrl(url) {
  await goto(url, { waitForNavigation: false });
};

commands.getUrl = async function getUrl() {
  return await currentURL();
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
