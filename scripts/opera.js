#!/usr/bin/env node

import { AndroidUiautomator2Driver } from 'appium-uiautomator2-driver';
import { ADB } from 'appium-adb';
import log from '../src/logger.js';
import { waitForCondition } from 'asyncbox';

const START_APP_WAIT_DURATION = 60000;

const opera = {
  pkg: 'com.opera.browser',
  activity: 'com.opera.android.BrowserActivity',
};

const common = {
  waitDuration: START_APP_WAIT_DURATION,
  optionalIntentArguments: '-d www.appium.io',
};

async function skipWelcomeOpera() {
  const adb = await ADB.createADB();
  await adb.adbExec(['shell', 'pm', 'clear', 'com.opera.browser']);
  //await adb.startApp(Object.assign({}, opera, common));
  const driver = new AndroidUiautomator2Driver();
  const caps = {
    platformName: "Android",
    "appium:automationName": "UiAutomator2",
    "appium:deviceName": "Android Device",
    "appium:appPackage": "com.opera.browser",
    "appium:appActivity": "com.opera.android.BrowserActivity",
  };
  try {
    await driver.createSession(null, {
      alwaysMatch: caps,
      firstMatch: [{}],
    });
    const activity = await driver.getCurrentActivity();
    log.info(`Activity is ${activity}`);
    if (activity.includes('Welcome')) {
      // Helper function to find element with waitForCondition
      const findElementWithWaitForCondition = async (
        strategy,
        selector,
        timeout = 30000
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
              intervalMs: 2000,
            }
          );
        } catch (error) {
          throw new Error(
            `Failed to find element (${strategy}: ${selector}) within ${timeout}ms timeout: ${error.message}`
          );
        }
      };

      const nextButton = await findElementWithWaitForCondition(
        'id',
        'com.opera.browser:id/continue_button'
      );
      log.info(`Next button is ${JSON.stringify(nextButton, null, 2)}`);
      await driver.click(nextButton.ELEMENT);

      const skipButton = await findElementWithWaitForCondition(
        'id',
        'com.opera.browser:id/skip_button'
      );

      const MAX_RETRIES = 3;
      let attempt = 0;
      let found = false;
      
      while (attempt < MAX_RETRIES && !found) {
        await driver.click(skipButton.ELEMENT);
        try{
          await findElementWithWaitForCondition(
            'xpath',
            '//android.widget.Button[@text="Enable notifications"]'
          );
          found = true;
        } catch(error) {
          log.info(`Enable notifications text not found, retrying skip...`);
          attempt++;
        }
      }

      const skipAgainButton = await findElementWithWaitForCondition(
        'id',
        'com.opera.browser:id/skip_button'
      );

      attempt = 0;
      found = false;
      while (attempt < MAX_RETRIES && !found) {
        await driver.click(skipAgainButton.ELEMENT);
        try{
          await findElementWithWaitForCondition(
            'xpath',
            '//android.widget.Button[@text="Allow"]'
          );
          found = true;
        } catch(error) {
          log.info(`Enable notifications text not found, retrying skip...`);
          attempt++;
        }
      }


      const allowButton = await findElementWithWaitForCondition(
        'xpath',
        '//android.widget.Button[@text="Allow"]'
      );
      await driver.click(allowButton.ELEMENT);

      attempt = 0;
      found = false;
      
      while (attempt < MAX_RETRIES && !found) {
        try{
          const doneButton = await findElementWithWaitForCondition('id', 'com.opera.browser:id/positive_button', 8000);
          await driver.click(doneButton.ELEMENT);
          found = true;
        } catch(error) {
          log.info(`Done button not found, retrying after opening a url...`);
        }
        finally {
          await adb.shell(['am', 'start', '-a', 'android.intent.action.VIEW', '-d', 'https://www.appium.io', opera.pkg]);
          attempt++;
        }
      }
    }
  } finally {
    await driver.deleteSession();
  }
}

(async () => {
  await skipWelcomeOpera();
  process.exit(0);
})();
