import urlCommands from "./url";
import findCommand from "./find";
import elementCommands from "./element";
let commands = {};

Object.assign(commands, urlCommands, findCommand, elementCommands);

export default commands;
