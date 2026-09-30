import { test, expect, Locator } from '@playwright/test'
test('Verify Form Filling in the TTA Practise Page', async ({ page }) => {
    await page.goto('https://app.thetestingacademy.com/playwright/tables/practice#page');
    await page.getByTestId("first-name").fill("Sanket");
    await page.getByRole('textbox', { name: "Last name" }).fill("Umrani");
    await page.getByRole('radio', { name: "Male" }).first().click();
    await page.locator("#years-experience").click();
    await page.selectOption("#years-experience", "7");
    await page.getByRole('textbox', { name: "Date" }).fill("2026-09-30");
    await page.getByRole('radio', { name: "Automation Tester" }).click();
    const tools = ["UFT", "Protractor", "Selenium Webdriver"];
    for (const tool of tools) {
        await page.locator(`input[value="${tool}"]`).click();
    }
    const cont = ["Asia", "Europe", "Africa", "Australia", "South America", "North America", "Antarctica"];
    for (const conts of cont) {
        await page.locator(`input[value="${conts}"]`).click();
    }
    await page.getByRole('tab', { name: "Browser Commands" }).click();
    await page.getByRole('button', { name: "Save profile" }).click();

    await expect(page.locator('#submission-output')).toBeVisible();
    const output = await page.locator('#submission-output').textContent();
    expect(output).toContain('Sanket');

    // await page.pause();

});