import { errors } from "@appium/base-driver";
import { $ } from "taiko";
import log from "../logger";

let commands = {},
  helpers = {},
  extensions = {};

commands.findElOrEls = async function findElOrEls(
  strategy,
  selector,
  mult,
  context
) {
  log.info(`Strategy is ${strategy}`);
  log.info(`Selector is ${selector}`);
  if (strategy === "xpath") {
    if (await $(selector).exists()) {
      return true;
    } else {
      throw new errors.NoSuchAlertError(`unable to find element: ${selector}`);
    }
  } else if (strategy === "id") {
    return await $(`#${selector}`).exists();
  }
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
