import { getNetwork } from '../cdp';
import urlCommands from './url';

let commands = {},
    helpers = {},
    extensions = {};

commands.setCookie = async function setCookie(cookie){
    const url = await urlCommands.getUrl();
    const origin = (new URL(url)).origin;

    const options = {};
    options.name = cookie.name;
    options.value = cookie.value;
    options.url = origin;

    const network = await getNetwork();
    return network.setCookie(options);
}    

commands.getCookies = async function getCookies(){
    const network = await getNetwork();
    const allCookies = await network.getAllCookies();
    return allCookies.cookies;
}

commands.getCookie = async function getCookie(key){
    const network = await getNetwork();
    const allCookies = await network.getAllCookies();
    return allCookies.cookies.filter((cookie) => {return cookie.name === key})[0];
}

commands.deleteCookie = async function deleteCookie(key) {
    const allCookies = await commands.getCookies();
    const cookie = allCookies.filter( (cookie) => { return cookie.name === key })[0];
    const network = await getNetwork();
    return network.deleteCookies({name: key, domain: cookie.domain});
}

commands.deleteCookies = async function deleteAllCookies() {
    const network = await getNetwork();
    return network.clearBrowserCookies();
}

Object.assign(extensions, commands, helpers);
export { commands, helpers, elementCache };
export default extensions;