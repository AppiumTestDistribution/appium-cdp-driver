import urlCommands from "./url";
import findCommand from "./find";
import elementCommands from "./element";
import navigationCommands from "./navigation";
import documentCommands from "./document";
import cookieCommands from "./cookies";

let commands = {};

Object.assign(commands, cookieCommands, documentCommands, navigationCommands, urlCommands, findCommand, elementCommands);

export default commands;
