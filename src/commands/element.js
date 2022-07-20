import { errors } from "@appium/base-driver";
import { $, click } from "taiko";
import log from "../logger";
import { util } from "@appium/support";
import { W3C_ELEMENT_KEY } from "@appium/base-driver/build/lib/constants";

let commands = {},
  helpers = {},
  extensions = {},
  elementCache = {};

commands.findElOrEls = async function findElOrEls(
  strategy,
  selector,
  mult,
  context
) {
  log.info(`Strategy is ${strategy}`);
  log.info(`Selector is ${selector}`);
  log.info(`Mult is ${mult}`);
  log.info(`Context is ${context}`);
  if (strategy === "xpath") {
    if (await $(selector).exists()) {
      const elementId = util.uuidV4();
      elementCache[elementId] = $(selector);
      return { [W3C_ELEMENT_KEY]: elementId };
    } else {
      throw new errors.NoSuchAlertError(`unable to find element: ${selector}`);
    }
  } else if (strategy === "id") {
    return await $(`#${selector}`).exists();
  }
};

async function _click(element) {
  await click(element);
}
commands.click = async function click(elementId) {
  const element = elementCache[elementId];
  console.log(element);
  await _click(element);
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
