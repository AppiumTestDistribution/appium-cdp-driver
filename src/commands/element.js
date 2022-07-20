import { errors } from "@appium/base-driver";
import { click } from "taiko";
import { elementCache } from "./find";

let commands = {},
  helpers = {},
  extensions = {};

async function _click(element) {
  await click(element);
}
commands.click = async function click(elementId) {
  const element = elementCache[elementId];
  await _click(element);
};

commands.getText = async function getText(elementId) {
  const element = elementCache[elementId];
  return element.text();
};

commands.elementDisplayed = async function elementDisplayed(elementId) {
  const element = elementCache[elementId];
  return element.isVisible();
};

commands.elementEnabled = async function elementEnabled(elementId) {
  const element = elementCache[elementId];
  return !element.isDisabled();
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
