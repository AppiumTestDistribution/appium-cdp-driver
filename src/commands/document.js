import { evaluate } from "taiko";

let commands = {},
  helpers = {},
  extensions = {};

commands.getPageSource = async function pageSource() {
    return evaluate( () => { return document.documentElement.outerHTML });
};

Object.assign(extensions, commands, helpers);
export { commands, helpers, elementCache };
export default extensions;