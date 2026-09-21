import { test, expect } from 'playwright/test';
test("Verfiy the error message in the wingify free trial", async ({ page }) => {
    await page.goto("https://wingify.com/free-trial/");
    let inputbox = page.locator("//input[@id='free-trial-step1-email']");
    await inputbox.fill("ABCD");

    let errormessage = page.locator("//div[contains(text(),'The email address you entered is incorrect.')]");

    await page.locator("#free-trial-step1-gdpr-consent-checkboxcu-marketing-consent-checkbox").click();
    await page.locator("#free-trial-step1-gdpr-consent-checkboxcu-gdpr-consent-checkbox").click();
    await page.locator("//span[contains(text(),'Create a Free Trial Account')]").click()
    await expect(errormessage).toContainText("The email address you entered is incorrect.");


})
// //normalize-space() will
// Remove leading spaces
// Remove trailing spaces
// Replace multiple spaces in between with a single space

//a[(normalize-space()='Make Appointment')]