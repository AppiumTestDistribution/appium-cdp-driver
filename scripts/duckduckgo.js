#!/usr/bin/env node

import { AndroidUiautomator2Driver } from 'appium-uiautomator2-driver';
import { ADB } from 'appium-adb';
import log from '../src/logger.js';
import { waitForCondition } from 'asyncbox';

const START_APP_WAIT_DURATION = 60000;

const duckduckgo = {
  pkg: 'com.duckduckgo.mobile.android',
  activity: 'com.duckduckgo.app.browser.BrowserActivity',
};

const common = {
  waitDuration: START_APP_WAIT_DURATION,
  optionalIntentArguments: '-d www.appium.io',
};

async function skipWelcomeDuckDuckGo() {
  const adb = await ADB.createADB();
  await adb.adbExec(['shell', 'pm', 'clear', 'com.duckduckgo.mobile.android']);
  const driver = new AndroidUiautomator2Driver();
  const caps = {
    platformName: "Android",
    "appium:automationName": "UiAutomator2",
    "appium:deviceName": "Android Device",
    "appium:appPackage": "com.duckduckgo.mobile.android",
    "appium:appActivity": "com.duckduckgo.app.browser.BrowserActivity",
  };
  try {
    await driver.createSession(null, {
      alwaysMatch: caps,
      firstMatch: [{}],
    });
    const activity = await driver.getCurrentActivity();
    log.info(`Activity is ${activity}`);
    if (activity.includes('BrowserActivity')) {
      const findElementWithWaitForCondition = async (
        strategy,
        selector,
        timeout = 6000
      ) => {
        try {
          return await waitForCondition(
            async () => {
              try {
                log.info(
                  `Attempting to find element (${strategy}: ${selector})`
                );
                const element = await driver.findElement(strategy, selector);
                log.info(
                  `Successfully found element (${strategy}: ${selector})`
                );
                return element;
              } catch (error) {
                // Return false to continue waiting
                return false;
              }
            },
            {
              waitMs: timeout,
              intervalMs: 1000,
            }
          );
        } catch (error) {
          throw new Error(
            `Failed to find element (${strategy}: ${selector}) within ${timeout}ms timeout: ${error.message}`
          );
        }
      };

      let attempt = 0;
      let found = false;
      const MAX_RETRIES = 3;
      
      while (attempt < MAX_RETRIES && !found) {
        try{
          const dismissButton = await findElementWithWaitForCondition(
            'id',
            'com.duckduckgo.mobile.android:id/bottomSheetPromoSecondaryButton'
          );
          log.info(`Dismiss button found: ${JSON.stringify(dismissButton, null, 2)} in attempt ${attempt}`);
          await driver.click(dismissButton.ELEMENT);
          found = true;
        } catch(error) {
          log.info(`Dismiss button not found, retrying after opening a url...`);
        }
        finally {
          await adb.shell(['am', 'start', '-a', 'android.intent.action.VIEW', '-d', 'https://www.appium.io', duckduckgo.pkg]);
          attempt++;
        }
      }
    }
  } finally {
    await driver.deleteSession();
  }
}

(async () => {
  await skipWelcomeDuckDuckGo();
  process.exit(0);
})();
