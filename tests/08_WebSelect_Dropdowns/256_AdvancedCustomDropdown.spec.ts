import { test, expect } from '@playwright/test';
test('Advanced Custom Dropdown', async ({ page }) => {
    await page.goto('https://app.thetestingacademy.com/playwright/tables/select-boxes');
    //Single Searchable Dropdown
    await page.locator('#rs-single').click();
    await page.getByRole('option', { name: 'Playwright' }).click();
    //await page.getByText('Cypress').click();

    //Multi-chips with  remove
    await page.locator('#rs-multi').click();
    await page.getByText('Pytest', { exact: true }).click();
    await page.getByText('Cucumber', { exact: true }).click();
    await page.keyboard.press('Escape');
    //Creatable multi type and Enter
    await page.locator('#rs-creatable').click();
    await page.getByTestId('rs-creatable-input').fill('Selenium');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');


    //Grouped Categorized options
    await page.locator('#rs-grouped').click();
    await page.getByRole('option', { name: 'Cloudflare Workers' }).click();

    // ⑤ Async — fetched on type
    await page.locator('#rs-async').click();
    await page.getByTestId('rs-async-input').fill('MU');
    //wait expect(page.getByTestId('rs-async-menu')).toContainText('Mumbai');
    await expect(page.getByTestId('rs-async-menu')).toContainText(/Mumbai/i);//Regex pattern passed in .toContainText() method to avoid case sensitive issue
    await page.getByRole('option', { name: /Mumbai/i }).click();
    //await page.pause();
});