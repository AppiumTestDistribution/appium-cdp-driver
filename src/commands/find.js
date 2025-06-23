import { errors } from '@appium/base-driver';
import { $ } from 'taiko';
import log from '../logger';
import { util } from '@appium/support';
import { W3C_ELEMENT_KEY } from '@appium/base-driver/build/lib/constants';

let commands = {},
  helpers = {},
  extensions = {},
  elementCache = {};

function getUUID() {
  return util.uuidV4();
}

helpers.findElOrEls = async function findElOrEls(
  strategy,
  selector,
  mult,
  context
) {
  log.info(`Strategy is ${strategy}`);
  log.info(`Selector is ${selector}`);
  log.info(`Mult is ${mult}`);
  log.info(`Context is ${context}`);
  const elStrategy = strategy === 'xpath' ? $(selector) : $(`#${selector}`);
  if ((await elStrategy.exists()) && !mult) {
    const elementId = getUUID();
    elementCache[elementId] = elStrategy;
    return { [W3C_ELEMENT_KEY]: elementId };
  } else if (mult) {
    let els = [];
    (await $(selector).elements()).forEach((element) => {
      const elementId = getUUID();
      elementCache[elementId] = element;
      els.push({ ELEMENT: elementId });
    });
    return els;
  } else {
    throw new errors.NoSuchElementError(`unable to find element: ${selector}`);
  }
};

commands.findElement = async function findElement(strategy, selector) {
  return this.findElOrEls(strategy, selector, false);
};

commands.findElements = async function findElements(strategy, selector) {
  return this.findElOrEls(strategy, selector, true);
};

Object.assign(extensions, commands, helpers);
export { commands, helpers, elementCache };
export default extensions;
