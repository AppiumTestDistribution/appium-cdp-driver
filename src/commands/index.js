import urlCommands from "./url";
import findCommand from "./find";
import elementCommands from "./element";
import navigationCommands from "./navigation";
import documentCommands from "./document";
import cookieCommands from "./cookies";
import screenshotComamnds from "./screencapture"

let commands = {};

Object.assign(commands, screenshotComamnds, cookieCommands, documentCommands, navigationCommands, urlCommands, findCommand, elementCommands);

export default commands;
