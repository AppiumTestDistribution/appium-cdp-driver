#!/usr/bin/env node

import { AndroidUiautomator2Driver } from 'appium-uiautomator2-driver';
import { ADB } from 'appium-adb';
import log from '../src/logger.js';
import { waitForCondition } from 'asyncbox';

const START_APP_WAIT_DURATION = 60000;

const edge = {
  pkg: 'com.microsoft.emmx',
  activity: 'com.microsoft.ruby.Main',
};

const common = {
  waitDuration: START_APP_WAIT_DURATION,
  optionalIntentArguments: '-d www.appium.io',
};

async function skipWelcomeEdge() {
  const adb = await ADB.createADB();
  await adb.adbExec(['shell', 'pm', 'clear', edge.pkg]);
  const driver = new AndroidUiautomator2Driver();
  const caps = {
    platformName: "Android",
    "appium:automationName": "UiAutomator2",
    "appium:deviceName": "Android Device",
    "appium:appPackage": edge.pkg,
    "appium:appActivity": edge.activity,
  };

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


  try {
    await driver.createSession(null, {
      alwaysMatch: caps,
      firstMatch: [{}],
    });
    const activity = await driver.getCurrentActivity();
    log.info(`Activity is ${activity}`);
    if (activity.includes('MicrosoftFirstRunActivity')) {
      // wait for the page to load
      await new Promise(resolve => setTimeout(resolve, 5000));

      const MAX_RETRIES = 3;
      let attempt = 0;
      let clicked = false;
      let found = false;
      var notNowButton;
      
      while (attempt < MAX_RETRIES && !clicked) {
        try{
          notNowButton = await findElementWithWaitForCondition(
            'xpath',
            '//android.widget.Button[@text="Not now"]'
          );
          log.info(`Not Now button is ${JSON.stringify(notNowButton, null, 2)}`);
          found = true;
        } catch(error) {
          log.info(`Not Now button not found, retrying ...`);
        } finally {
          if (found) {
            await driver.click(notNowButton.ELEMENT);
            clicked = true;
          }
          attempt++;
        }
      }

      attempt = 0;
      clicked = false;
      found = false;
      var checkBox;

      while (attempt < MAX_RETRIES && !clicked) {
        try{
          checkBox = await findElementWithWaitForCondition(
            'xpath',
            '//android.widget.Image'
          );
          log.info(`Check box is ${JSON.stringify(checkBox, null, 2)}`);
          found = true;
        } catch(error) {
          log.info(`Check box not found, retrying the other xpath...`);
          try {
            checkBox = await findElementWithWaitForCondition(
              'xpath',
              '//android.widget.CheckBox[@text="Help improve Microsoft products by sending optional diagnostic data about how you use the browser, websites you visit, and crash reports."]'
            );
            log.info(`Check box is ${JSON.stringify(checkBox, null, 2)}`);
            found = true;
          } catch(error) {
            log.info(`Check box not found, retrying...`);
          }
        } finally {
          if (found) {
            await driver.click(checkBox.ELEMENT);
            clicked = true;
          }
          attempt++;
        }
      }

      attempt = 0;
      clicked = false;
      found = false;
      var confirmButton;

      while (attempt < MAX_RETRIES && !clicked) {
        try{
          confirmButton = await findElementWithWaitForCondition(
            'xpath',
            '//android.widget.Button[@text="Confirm"]'
          );
          log.info(`Confirm button is ${JSON.stringify(confirmButton, null, 2)}`);
          found = true;
        } catch(error) {
          log.info(`Confirm button not found, retrying...`);
        } finally {
          if (found) {
            await driver.click(confirmButton.ELEMENT);
            clicked = true;
          }
          attempt++;
        }
      }
    }
  } finally {
    await driver.deleteSession();
  }

  try {
    caps["appium:noReset"] = true;
    await driver.createSession(null, {
      alwaysMatch: caps,
      firstMatch: [{}],
    });
    const activity = await driver.getCurrentActivity();
    log.info(`Activity is ${activity}`);
    if (activity.includes('GrantPermissionsActivity')) {
      // wait for the page to load
      await new Promise(resolve => setTimeout(resolve, 5000));

      const MAX_RETRIES = 3;
      let attempt = 0;
      let clicked = false;
      let found = false;
      var denyButton;
      
      while (attempt < MAX_RETRIES && !clicked) {
        try{
          denyButton = await findElementWithWaitForCondition(
            'id',
            'com.android.permissioncontroller:id/permission_allow_button'
          );
          log.info(`Deny button is ${JSON.stringify(denyButton, null, 2)}`);
          found = true;
        } catch(error) {
          log.info(`Deny button not found, retrying ...`);
        } finally {
          if (found) {
            await driver.click(denyButton.ELEMENT);
            clicked = true;
          }
          attempt++;
        }
      }
    }
  } finally {
    await driver.deleteSession();
  }



}

(async () => {
  await skipWelcomeEdge();
  process.exit(0);
})();
