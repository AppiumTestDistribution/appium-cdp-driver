#!/usr/bin/env node

import { AndroidUiautomator2Driver } from 'appium-uiautomator2-driver';
import { ADB } from 'appium-adb';
import log from '../src/logger.js';

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
  await adb.startApp(Object.assign({}, opera, common));
  const driver = new AndroidUiautomator2Driver();
  const caps = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Android Device',
  };
  await driver.createSession(null, {
    alwaysMatch: caps,
    firstMatch: [{}],
  });
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const activity = await driver.getCurrentActivity();
  log.info(`Activity is ${activity}`);
  if (activity.includes('Welcome')) {
    // Helper function to find element with retry logic
    const findElementWithRetry = async (strategy, selector, maxRetries = 5) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          log.info(
            `Attempting to find element (${strategy}: ${selector}) - Attempt ${attempt}/${maxRetries}`
          );
          const element = await driver.findElement(strategy, selector);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second after finding element
          log.info(
            `Successfully found element (${strategy}: ${selector}) on attempt ${attempt}`
          );
          return element;
        } catch (error) {
          log.info(
            `Failed to find element (${strategy}: ${selector}) on attempt ${attempt}: ${error.message}`
          );
          if (attempt === maxRetries) {
            throw new Error(
              `Failed to find element (${strategy}: ${selector}) after ${maxRetries} attempts: ${error.message}`
            );
          }
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    };

    const nextButton = await findElementWithRetry(
      'id',
      'com.opera.browser:id/continue_button'
    );
    log.info(`Next button is ${JSON.stringify(nextButton, null, 2)}`);
    await driver.click(nextButton.ELEMENT);

    const skipButton = await findElementWithRetry(
      'id',
      'com.opera.browser:id/skip_button'
    );
    await driver.click(skipButton.ELEMENT);

    const skipAgainButton = await findElementWithRetry(
      'id',
      'com.opera.browser:id/skip_button'
    );
    await driver.click(skipAgainButton.ELEMENT);

    const allowButton = await findElementWithRetry(
      'xpath',
      '//android.widget.Button[@text="Allow"]'
    );
    await driver.click(allowButton.ELEMENT);
  }
}

(async () => await skipWelcomeOpera())();
