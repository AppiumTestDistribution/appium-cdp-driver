import urlCommands from "./url";
import findCommand from "./find";
import elementCommands from "./element";
import navigationCommands from "./navigation";
import documentCommands from "./document"
let commands = {};

Object.assign(commands, documentCommands, navigationCommands, urlCommands, findCommand, elementCommands);

export default commands;
