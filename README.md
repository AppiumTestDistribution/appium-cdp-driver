# Appium CDP Driver

Appium CDP Driver is a W3C WebDriver that allows you to connect to chromium based android mobile browsers like chrome & samsung browser through any WebDriver client.

## Installation

Install `cdp-driver` (if not installed)

```sh
appium driver install --source npm appium-cdp-driver
```

Run Appium

```sh
LOCAL_PROTOCOL=true appium server -pa /wd/hub --use-drivers=cdp-driver
```

## Capabilities

### Appium Capabilities

| Capability              | Required |  Type  | Description                   |
| ----------------------- | :------: | :----: | ----------------------------- |
| `appium:automationName` |    +     | string | Must be `CDP`                 |
| `appium:browserName`    |    +     | string | Must be `chrome` or `Terrace` |

### W3C Capabilities

| Capability     | Required |  Type  | Description       |
| -------------- | :------: | :----: | ----------------- |
| `platformName` |    +     | string | Must be `android` |

## Commands

| Command                                                      | Ref                                                                  | Description             | Implementation Status |
| ------------------------------------------------------------ | -------------------------------------------------------------------- | ----------------------- | --------------------- |
| [active](src/commands/active.js)                             | [here](https://www.w3.org/TR/webdriver/#dfn-get-active-element)      | Get Active Element      | ❌                    |
| [back](src/commands/back.js)                                 | [here](https://www.w3.org/TR/webdriver/#dfn-back)                    | Back                    | ✅                    |
| [clear](src/commands/clear.js)                               | [here](https://www.w3.org/TR/webdriver/#dfn-element-clear)           | Element Clear           | ✅                    |
| [click](src/commands/click.js)                               | [here](https://www.w3.org/TR/webdriver/#dfn-element-click)           | Element Click           | ✅                    |
| [closeWindow](src/commands/closeWindow.js)                   | [here](https://www.w3.org/TR/webdriver/#dfn-close-window)            | Close Window            | ❌                    |
| [createSession](src/commands/createSession.js)               | [here](https://www.w3.org/TR/webdriver/#dfn-new-sessions)            | New Session             | ✅                    |
| [createWindow](src/commands/createWindow.js)                 | [here](https://www.w3.org/TR/webdriver/#dfn-new-window)              | New Window              | ❌                    |
| [deleteCookie](src/commands/deleteCookie.js)                 | [here](https://www.w3.org/TR/webdriver/#dfn-delete-cookie)           | Delete Cookie           | ✅                    |
| [deleteCookies](src/commands/deleteCookies.js)               | [here](https://www.w3.org/TR/webdriver/#dfn-delete-all-cookies)      | Delete All Cookies      | ✅                    |
| [deleteSession](src/commands/deleteSession.js)               | [here](https://www.w3.org/TR/webdriver/#dfn-delete-session)          | Delete Session          | ✅                    |
| [elementDisplayed](src/commands/elementDisplayed.js)         | [here](https://www.w3.org/TR/webdriver/#element-displayedness)       | Is Element Displayed    | ✅                    |
| [elementEnabled](src/commands/elementEnabled.js)             | [here](https://www.w3.org/TR/webdriver/#dfn-is-element-enabled)      | Is Element Enabled      | ✅                    |
| [elementSelected](src/commands/elementSelected.js)           | [here](https://www.w3.org/TR/webdriver/#dfn-is-element-selected)     | Is Element Selected     | ❌                    |
| [execute](src/commands/execute.js)                           | [here](https://www.w3.org/TR/webdriver/#dfn-execute-script)          | Execute Script          | ❌                    |
| [executeAsync](src/commands/executeAsync.js)                 | [here](https://www.w3.org/TR/webdriver/#dfn-execute-async-script)    | Execute Async Script    | ❌                    |
| [findElOrEls](src/commands/findElOrEls.js)                   | [here](https://www.w3.org/TR/webdriver/#element-retrieval)           | Find Elements           | ✅                    |
| [forward](src/commands/forward.js)                           | [here](https://www.w3.org/TR/webdriver/#dfn-forward)                 | Forward                 | ✅                    |
| [fullScreenWindow](src/commands/fullScreenWindow.js)         | [here](https://www.w3.org/TR/webdriver/#dfn-fullscreen-window)       | Fullscreen Window       | Not supported                   |
| [getAlertText](src/commands/getAlertText.js)                 | [here](https://www.w3.org/TR/webdriver/#dfn-get-alert-text)          | Get Alert Text          | ❌                    |
| [getAttribute](src/commands/getAttribute.js)                 | [here](https://www.w3.org/TR/webdriver/#dfn-get-element-attribute)   | Get Element Attribute   | ✅                    |
| [getComputedLabel](src/commands/getComputedLabel.js)         | [here](https://www.w3.org/TR/webdriver/#dfn-get-computed-label)      | Get Computed Label      | ❌                    |
| [getComputedRole](src/commands/getComputedRole.js)           | [here](https://www.w3.org/TR/webdriver/#dfn-get-computed-role)       | Get Computed Role       | ❌                    |
| [getCookie](src/commands/getCookie.js)                       | [here](https://www.w3.org/TR/webdriver/#dfn-get-named-cookie)        | Get Named Cookie        | ✅                    |
| [getCookies](src/commands/getCookies.js)                     | [here](https://www.w3.org/TR/webdriver/#dfn-get-all-cookies)         | Get All Cookies         | ✅                    |
| [getCssProperty](src/commands/getCssProperty.js)             | [here](https://www.w3.org/TR/webdriver/#dfn-get-element-css-value)   | Get Element CSS Value   | ❌                    |
| [getElementRect](src/commands/getElementRect.js)             | [here](https://www.w3.org/TR/webdriver/#dfn-get-element-rect)        | Get Element Rect        | ✅                    |
| [getElementScreenshot](src/commands/getElementScreenshot.js) | [here](https://www.w3.org/TR/webdriver/#dfn-take-element-screenshot) | Take Element Screenshot | ✅                    |
| [getName](src/commands/getName.js)                           | [here](https://www.w3.org/TR/webdriver/#dfn-get-element-tag-name)    | Get Element Tag Name    | ✅                     |
| [getPageSource](src/commands/getPageSource.js)               | [here](https://www.w3.org/TR/webdriver/#dfn-get-page-source)         | Get Page Source         | ✅                    |
| [getProperty](src/commands/getProperty.js)                   | [here](https://www.w3.org/TR/webdriver/#dfn-get-element-property)    | Get Element Property    | ❌                    |
| [getScreenshot](src/commands/getScreenshot.js)               | [here](https://www.w3.org/TR/webdriver/#dfn-take-screenshot)         | Take Screenshot         | ✅                    |
| [getText](src/commands/getText.js)                           | [here](https://www.w3.org/TR/webdriver/#dfn-get-element-text)        | Get Element Text        | ✅                    |
| [getTimeouts](src/commands/getTimeouts.js)                   | [here](https://www.w3.org/TR/webdriver/#dfn-get-timeouts)            | Get Timeouts            | ❌                    |
| [getUrl](src/commands/url.js)                                | [here](https://www.w3.org/TR/webdriver/#dfn-get-current-url)         | Get Current URL         | ✅                    |
| [getWindowHandle](src/commands/getWindowHandle.js)           | [here](https://www.w3.org/TR/webdriver/#dfn-get-window-handle)       | Get Window Handle       | ❌                    |
| [getWindowHandles](src/commands/getWindowHandles.js)         | [here](https://www.w3.org/TR/webdriver/#dfn-get-window-handles)      | Get Window Handles      | ❌                    |
| [getWindowRect](src/commands/getWindowRect.js)               | [here](https://www.w3.org/TR/webdriver/#dfn-get-window-rect)         | Get Window Rect         | ❌                    |
| [implicitWaitW3C](src/commands/implicitWaitW3C.js)           | [here](https://www.w3.org/TR/webdriver/#dfn-set-timeouts)            | Set Implicit Timeout    | ❌                    |
| [maximizeWindow](src/commands/maximizeWindow.js)             | [here](https://www.w3.org/TR/webdriver/#dfn-maximize-window)         | Maximize Window         | ❌                    |
| [minimizeWindow](src/commands/minimizeWindow.js)             | [here](https://www.w3.org/TR/webdriver/#dfn-minimize-window)         | Minimize Window         | ❌                    |
| [pageLoadTimeoutW3C](src/commands/pageLoadTimeoutW3C.js)     | [here](https://www.w3.org/TR/webdriver/#dfn-set-timeouts)            | Set Page Load Timeout   | ❌                    |
| [parentFrame](src/commands/parentFrame.js)                   | [here](https://www.w3.org/TR/webdriver/#dfn-switch-to-parent-frame)  | Switch To Parent Frame  | ❌                    |
| [performActions](src/commands/performActions.js)             | [here](https://www.w3.org/TR/webdriver/#dfn-perform-actions)         | Perform Actions         | ❌                    |
| [postAcceptAlert](src/commands/postAcceptAlert.js)           | [here](https://www.w3.org/TR/webdriver/#dfn-accept-alert)            | Accept Alert            | ❌                    |
| [postDismissAlert](src/commands/postDismissAlert.js)         | [here](https://www.w3.org/TR/webdriver/#dfn-dismiss-alert)           | Dismiss Alert           | ❌                    |
| [printPage](src/commands/printPage.js)                       | [here](https://www.w3.org/TR/webdriver/#dfn-print-page)              | Print Page              | ❌                    |
| [refresh](src/commands/refresh.js)                           | [here](https://www.w3.org/TR/webdriver/#dfn-refresh)                 | Refresh                 | ✅                    |
| [releaseActions](src/commands/releaseActions.js)             | [here](https://www.w3.org/TR/webdriver/#dfn-release-actions)         | Release Actions         | ❌                    |
| [scriptTimeoutW3C](src/commands/scriptTimeoutW3C.js)         | [here](https://www.w3.org/TR/webdriver/#dfn-set-timeouts)            | Set Script Timeout      | ❌                    |
| [setAlertText](src/commands/setAlertText.js)                 | [here](https://www.w3.org/TR/webdriver/#dfn-send-alert-text)         | Send Alert Text         | ❌                    |
| [setCookie](src/commands/setCookie.js)                       | [here](https://www.w3.org/TR/webdriver/#dfn-adding-a-cookie)         | Add Cookie              | ✅                    |
| [setFrame](src/commands/setFrame.js)                         | [here](https://www.w3.org/TR/webdriver/#dfn-switch-to-frame)         | Switch To Frame         | ❌                    |
| [setUrl](src/commands/url.js)                                | [here](https://www.w3.org/TR/webdriver/#dfn-navigate-to)             | Navigate To             | ✅                    |
| [setValue](src/commands/setValue.js)                         | [here](https://www.w3.org/TR/webdriver/#dfn-element-send-keys)       | Element Send Keys       | ✅                    |
| [setWindow](src/commands/setWindow.js)                       | [here](https://www.w3.org/TR/webdriver/#dfn-switch-to-window)        | Switch To Window        | ❌                    |
| [setWindowRect](src/commands/setWindowRect.js)               | [here](https://www.w3.org/TR/webdriver/#dfn-set-window-rect)         | Set Window Rect         | Not supported                    |
| [title](src/commands/title.js)                               | [here](https://www.w3.org/TR/webdriver/#dfn-get-title)               | Get Title               | ✅                    |
| [uploadFile](src/commands/uploadFile.js)                     | -                                                                    | Upload File             | Not supported                    |
