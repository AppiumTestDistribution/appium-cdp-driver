import { goto, currentURL, reload } from "taiko";

let commands = {},
  helpers = {},
  extensions = {};

commands.setUrl = async function setUrl(url) {
  await goto(url, { waitForNavigation: false });
};

commands.getUrl = async function getUrl() {
  return await currentURL();
};

commands.refresh = async function refresh() {
  return await reload();
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
