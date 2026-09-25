import {chromium} from 'playwright'; //if we use playwright then we need to manually create BrowserContext Context Page and purpose is for creating utilities using playwright
//import {test,expect} from '@playwright/test'; when we use @playwright/test, the test already has page fixture created which includes BrowserContext,Context and Page 
import dotenv from "dotenv"
dotenv.config(); //credentials live in .env which is made gitignored
const VWO_USER=process.env.VWO_USER;
const VWO_PASS=process.env.VWO_PASS;

async function saveSession()
{
let browser=await chromium.launch({headless:false});
let context=await browser.newContext();
let page=await context.newPage();
await page.goto("https://app.wingify.com/#/login");


await page.fill("#login-username", VWO_USER!);
await page.fill("#login-password", VWO_PASS!);

await page.click("#js-login-btn");
await page.waitForURL(/#\/(dashboard|home)/, { timeout: 15000 });
await context.storageState({ path: "./user-session.json" }); //storageState is a function of Context and not Page
console.log("Session saved to user-session.json ✅");

    await browser.close();
}
saveSession();

/**
 * Correct way to run your script

If your file is named:

saveSession.js

Run it with:

node saveSession.js

If your project uses TypeScript:

npx tsx saveSession.ts

The exact command depends on your file type and Node.js module configuration.
 */

/**
 * Your code is a utility script:

async function saveSession() {
  // Login and save storage state
}

It does not contain a Playwright test such as:

test('Login test', async ({ page }) => {
  // Test steps
});

If you run:

npx playwright test your-script.js

the Playwright Test runner tries to find test cases in that file. Since your script does not define tests, it can report No tests found.
 */