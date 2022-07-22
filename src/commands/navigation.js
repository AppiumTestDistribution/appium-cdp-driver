import { title, goBack, goForward } from "taiko";

let commands = {},
  helpers = {},
  extensions = {};

commands.title = async function pageTitle() {
  return await title();
};

commands.back = async function back() {
  await goBack();
};

commands.forward = async function forward() {
  await goForward();
};

Object.assign(extensions, commands, helpers);
export { commands, helpers, elementCache };
export default extensions;
