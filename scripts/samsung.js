#!/usr/bin/env node

import { AndroidUiautomator2Driver } from 'appium-uiautomator2-driver';
import { ADB } from 'appium-adb';
import { resolveAdbPort } from '../src/adb.js';
import log from '../src/logger.js';
import { waitForCondition } from 'asyncbox';
import { finishSession } from './browserReady.js';

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
  const adbPort = resolveAdbPort();
  const adb = await ADB.createADB({ adbPort });
  await adb.adbExec(['shell', 'pm', 'clear', samsung.pkg]);
  const driver = new AndroidUiautomator2Driver();
  const caps = {
    platformName: "Android",
    "appium:automationName": "UiAutomator2",
    "appium:adbPort": adbPort,
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

      // The agree button is not the same on every build: newer intros label it
      // "Continue" and do not expose help_intro_legal_agree_button. Try the id
      // first, then the label.
      //
      // Note the intro also carries a "Close app" button beside it, and a
      // SystemUI ANR dialog ("Close app" / "Wait") can sit on top of the whole
      // screen. Only ever match the affordances below by exact text — clicking
      // "Close app" would kill the browser we are setting up.
      const INTRO_SELECTORS = [
        ['id', 'com.sec.android.app.sbrowser:id/help_intro_legal_agree_button'],
        ['xpath', '//android.widget.Button[@text="Continue"]'],
        ['xpath', '//android.widget.Button[@text="Agree"]'],
      ];

      const MAX_RETRIES = 2;
      let attempt = 0;

      while (attempt < MAX_RETRIES) {
        let clicked = false;
        for (const [strategy, selector] of INTRO_SELECTORS) {
          try {
            const buttonToClick = await findElementWithWaitForCondition(strategy, selector, 4000);
            await driver.click(buttonToClick.ELEMENT);
            log.info(`intro dismissed via ${strategy}: ${selector}`);
            clicked = true;
            break;
          } catch (error) {
            // try the next shape
          }
        }
        if (!clicked) {
          log.info('intro button not found on this attempt');
        }
        attempt++;
      } 
    }
    // Samsung shows a privacy-notice alert on SBrowserMainActivity, after the
    // intro rather than as part of it, so the branch above never sees it. It does
    // not block the devtools socket — the page loads underneath — so the
    // readiness pass has nothing to react to and the dialog would sit over the
    // page for the whole session, swallowing taps meant for the content.
    for (const selector of [
      '//android.widget.Button[@resource-id="android:id/button1" and @text="Continue"]',
      '//android.widget.Button[@text="Continue"]',
    ]) {
      try {
        const dialogButton = await driver.findElement('xpath', selector);
        await driver.click(dialogButton.ELEMENT);
        log.info(`dismissed post-intro dialog via ${selector}`);
        break;
      } catch (error) {
        // not shown on this launch
      }
    }
  } catch (error) {
    log.info(`walkthrough did not complete (${error.message}) — checking readiness anyway`);
  } finally {
    await finishSession(driver, {
      adb,
      pkg: samsung.pkg,
      component: `${samsung.pkg}/${samsung.activity}`,
      socket: 'Terrace_devtools_remote',
      selectors: [
        '//*[@resource-id="com.sec.android.app.sbrowser:id/help_intro_legal_agree_button"]',
        '//android.widget.Button[@text="Agree"]',
        '//android.widget.Button[@text="I agree"]',
      ],
    });
  }
}

(async () => {
  await skipWelcomeSamsung();
  process.exit(0);
})();
