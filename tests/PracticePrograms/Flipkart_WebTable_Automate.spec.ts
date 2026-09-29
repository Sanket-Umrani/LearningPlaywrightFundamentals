import { test, expect, Locator } from '@playwright/test'
test('Verify Pagination features on Flipkart page', async ({ page }) => {
    await page.goto('https://www.flipkart.com/');
    await page.locator('[role="button"]').click();
    await page.locator('.nw1UBF.v1zwn26').first().fill('DSLR Camera');
    await page.locator('button[type="submit"]').click();
    let pageNo = 1;
     while (pageNo <= 5) {
        console.log(`\n===== PAGE ${pageNo} =====`);
        const items = page.locator('//div[@class="RG5Slk"]');
        const price = page.locator('//div[@class="hZ3P6w DeU9vF"]');
        const count = await items.count();
        console.log("Number of products:", await items.count());

        for (let i = 0; i < await items.count(); i++) {

            const nameLocator = await items.nth(i).innerText();

            const priceLocator = await price.nth(i).innerText();

            console.log(`${nameLocator} --> ${priceLocator}`);
        }
        const nextBtn = page.locator('a').filter({ hasText: 'Next' });
        await nextBtn.click();

        if (pageNo === 5) {
        break;
        }
        pageNo++;
}
await page.waitForTimeout(10000);
});
