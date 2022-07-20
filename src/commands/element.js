import { errors } from "@appium/base-driver";

import { click, into, write, goBack, goForward } from "taiko";
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

commands.setValue = async function setValue(value, elementId) {
  const element = elementCache[elementId];
  await write(value, into(element));
}

commands.clear = async function clear(elementId) {
  const element = elementCache[elementId];
  await write('', into(element));
};

commands.back = async function back() {
  await goBack();
};

commands.forward = async function forward() {
  await goForward();
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
