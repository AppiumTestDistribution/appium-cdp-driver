import { screenshot } from "taiko";
import { elementCache } from "./find";

let commands = {},
  helpers = {},
  extensions = {};

commands.getScreenshot = async function getScreenshot() {
  return screenshot({encoding: "base64"});
};

commands.getElementScreenshot = async function getElementScreenshot(elementId) {
  const element = elementCache[elementId];
  return screenshot(element, {encoding: "base64"});
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
