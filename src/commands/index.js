import urlCommands from "./url";
import findCommand from "./find";
import elementCommands from "./element";
import navigationCommnds from "./navigation";
let commands = {};

Object.assign(commands, navigationCommnds, urlCommands, findCommand, elementCommands);

export default commands;
