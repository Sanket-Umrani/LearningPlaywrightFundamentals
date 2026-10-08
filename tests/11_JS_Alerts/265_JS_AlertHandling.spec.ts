import { test, expect, Locator } from '@playwright/test';
//test.describe() is used to group related tests together. 
// It helps in organizing the test cases and provides a way to set up and tear down resources before and after the tests run. 
// In this case, we are grouping tests related to handling JavaScript alerts.
//Anonymous arrow function is used as the second argument to test.describe().
let url;
test.describe('JS Alerts Handling', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(60000);
        await page.goto('https://the-internet.herokuapp.com/javascript_alerts');

    })
    test('JS Alert Accept 1', async ({ page }) => {
        await page.getByRole('button', { name: 'Click for JS Alert' }).click();
        page.once('dialog', async dialog => {
            console.log('Alert Type:', dialog.type());
            console.log('Alert Message:', dialog.message());
            expect(dialog.message()).toBe('I am a JS Alert');
            await dialog.accept();

        });
        await page.pause();

    });
    test('JS Alert Accept2', async ({ page }) => {
        page.once('dialog', async dialog => {
            console.log('Alert Type', dialog.type());
            console.log('Alert Message', dialog.message());
            expect(dialog.message()).toBe('I am a JS Confirm');
            await dialog.accept();

        });
        await page.locator('button', { hasText: 'Click for JS Confirm' }).click();
        await expect(page.locator('#result')).toHaveText('You clicked: Ok');


    });
    test('JS Alert Accept 3', async ({ page }) => {
        const inputText = 'Hello from The Testing Academy';
        page.once('dialog', async dialog => {
            console.log('Alert Type', dialog.type());
            console.log('Alert Message', dialog.message());
            expect(dialog.message()).toBe('I am a JS prompt');
            expect(dialog.type()).toBe('prompt');
            expect(dialog.defaultValue()).toBe("");

            await dialog.accept(inputText);

        });
        await page.locator('button', { hasText: 'Click for JS Prompt' }).click();
        await expect(page.locator('#result')).toHaveText(`You entered: ${inputText}`);

    });

});