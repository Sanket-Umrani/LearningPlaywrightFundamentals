import { test, expect } from '@playwright/test';

test.use({
    storageState: './user-session.json',
    screenshot: 'on',
    video: 'on',
    trace: 'on',
});

test('capture dashboard screenshot, video, and trace', async ({ page }, testInfo) => {
    await page.goto('https://app.wingify.com/#/dashboard?accountId=1281646');
    await page.waitForTimeout(3000);
    await testInfo.attach('dashboard screenshot', {
        body: await page.screenshot(),
        contentType: 'image/png',
    });

    await expect(page).toHaveURL(/dashboard/);
});
