#!/usr/bin/env node

import { AndroidUiautomator2Driver } from 'appium-uiautomator2-driver';
import { ADB } from 'appium-adb';
import log from '../src/logger.js';
import { waitForCondition } from 'asyncbox';

const START_APP_WAIT_DURATION = 60000;

const samsung = {
  pkg: 'com.sec.android.app.sbrowser',
  activity: 'com.sec.android.app.sbrowser.SBrowserMainActivity',
};

const common = {
  waitDuration: START_APP_WAIT_DURATION,
  optionalIntentArguments: '-d www.appium.io',
};

async function skipWelcomeSamsung() {
  const adb = await ADB.createADB();
  await adb.adbExec(['shell', 'pm', 'clear', samsung.pkg]);
  const driver = new AndroidUiautomator2Driver();
  const caps = {
    platformName: "Android",
    "appium:automationName": "UiAutomator2",
    "appium:deviceName": "Android Device",
    "appium:appPackage": samsung.pkg,
    "appium:appActivity": samsung.activity,
  };
  try {
    await driver.createSession(null, {
      alwaysMatch: caps,
      firstMatch: [{}],
    });
    const activity = await driver.getCurrentActivity();
    log.info(`Activity is ${activity}`);
    if (activity.includes('HelpIntroActivity')) {
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

      const MAX_RETRIES = 2;
      let attempt = 0;
      
      while (attempt < MAX_RETRIES) {
        try{
          const buttonToClick = await findElementWithWaitForCondition(
            'id',
            'com.sec.android.app.sbrowser:id/help_intro_legal_agree_button'
          );
          log.info(`Button to click is ${JSON.stringify(buttonToClick, null, 2)}`);
          await driver.click(buttonToClick.ELEMENT);

        } catch(error) {
          log.info(`Continue button not found, retrying...`);
        } finally {
          attempt++;
        }
      } 
    }
  } finally {
    await driver.deleteSession();
  }
}

(async () => {
  await skipWelcomeSamsung();
  process.exit(0);
})();
