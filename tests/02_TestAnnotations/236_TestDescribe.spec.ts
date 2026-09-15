import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {

    test('valid credentials', async ({ page }) => {
        await page.goto("https://app.thetestingacademy.com/playwright/");
    });
    test('invalid password', async ({ page }) => {
        await page.goto("https://app.thetestingacademy.com/playwright/");
    });

    test.fixme('1checkout with PayPal', async ({ page }) => {
        // currently skip this fix and run later
    });

    test.skip('checkout with PayPal', async ({ page }) => {
        // feature is not ready so the test case can be skipped
    });
    // test.only('checkout with PayPal2', async ({ page }) => {
    //     // which
    // });
})

// npx playwright test -g "Login Page"