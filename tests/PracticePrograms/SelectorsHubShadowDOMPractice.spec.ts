import { test, expect, Locator } from '@playwright/test';
test.describe('Hnadling Shadow DOM in SelectorsHub', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://selectorshub.com/xpath-practice-page/');

    });
    test('Verify ShadoDOM Elements', async ({ page }) => {
        const shadowDOMs = page.locator('#userName');
        await shadowDOMs.getByRole('textbox', { name: 'user name field' }).fill('Ferdinand');
        await shadowDOMs.getByPlaceholder('Enter pizza name').fill('Double Cheeze');
        await page.keyboard.press('Tab');
        await page.keyboard.type('Conceptually Sound');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.type('456789');
        await page.pause();
    });

});