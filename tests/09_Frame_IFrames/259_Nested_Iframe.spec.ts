import { test, expect, FrameLocator } from '@playwright/test';
test('Nested Iframe Verification', async ({ page }) => {
    await page.goto('https://selectorshub.com/iframe-scenario/');
    let frame1: FrameLocator = page.frameLocator('#pact1').first();
    let frame2: FrameLocator = frame1.frameLocator('#pact2').first();
    let frame3: FrameLocator = frame2.frameLocator('#pact3').first();
    await frame1.locator('#inp_val').fill('Jennifer Lopez');
    await frame2.locator('#jex').fill('Jennifer Aniston');
    await frame3.locator('#glaf').fill('Dil Mange More');
    const headerText = await frame1.locator('h3').innerText();
    console.log(headerText);
    await page.waitForTimeout(5000);
    page.keyboard


    await page.pause();
});