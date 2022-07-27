import { click, into, write } from "taiko";
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
  return !await element.isDisabled();
};

commands.setValue = async function setValue(value, elementId) {
  const element = elementCache[elementId];
  await write(value, into(element));
};

commands.clear = async function clear(elementId) {
  const element = elementCache[elementId];
  await write("", into(element));
};

commands.getAttribute = async function getAttribute(value, elementId) {
  const element = elementCache[elementId];
  return await element.attribute(value);
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
