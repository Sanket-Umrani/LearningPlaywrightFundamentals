import { test, expect } from '@playwright/test'

test('Navigate to CURA Health Services and CLick on Make Appointment', async ({ page }) => {
    await page.goto("https://katalon-demo-cura.herokuapp.com/", {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
        referer: 'https://katalon-demo-cura.herokuapp.com/'
    });

    let landingpage = page.locator('h1');
    await expect(landingpage).toContainText('CURA Healthcare Service');

    let mkappbtn = page.locator('#btn-make-appointment');
    await mkappbtn.click();
    let userNameField = page.locator('#txt-username');
    let passwordField = page.locator('#txt-password');
    let loginButton = page.locator('#btn-login')
    await userNameField.fill('John Doe');
    await passwordField.fill('ThisIsNotAPassword');
    await loginButton.click();

    let expMessage = page.locator('#btn-make-appointment');
    await expect(expMessage).toContainText('Make Appointment');

    await page.pause();




});

