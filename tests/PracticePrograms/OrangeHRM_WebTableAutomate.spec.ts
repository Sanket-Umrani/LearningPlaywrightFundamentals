import { test, expect, Locator } from '@playwright/test'
import dotenv from "dotenv"

test('Verify OrangeHRM Employee Add,Search From List,Delete', async ({ page }) => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await page.locator('input[placeholder="Username"]').fill(process.env.ORANGEHRM_USER!);
    await page.locator('input[placeholder="Password"]').fill(process.env.ORANGEHRM_PASS!);
    await page.locator('button[type="submit"]').click();

    //Navigate to PIM and click on it
    await page.locator('//span[text()="PIM"]').click();

    await page.waitForTimeout(5000);
    // Search Employee
    const name = 'STRIKE EAGLES';
    await page.getByPlaceholder('Type for hints...').first().fill('STRIKE EAGLES');

    //Search 
    await page.getByRole('button', { name: ' Search ' }).click();
    //Filter the row by name 
    const row = page.locator('[role="row"]').filter({
        hasText: name
    });

    await row.locator('.oxd-checkbox-wrapper').click();
    //Deleting the filtered record
    await row.locator('button:has(i.bi-trash)').click();
    await page.waitForTimeout(2000);
    //     await page.locator('.oxd-icon bi-trash').click();
    await page.getByRole('button', { name: ' Yes, Delete ' }).click();
    // Success Message
    await expect(page.getByText('Successfully Deleted')).toBeVisible();

    await page.pause();
    
    // //Add an Employee 
    // await page.getByRole('button', {name: 'Add' }).click();
    // await page.locator('input[name="firstName"]').fill('TEKNAS');
    // await page.locator('input[name="lastName"]').fill('INARMU');
    // await page.getByRole('button', {name: 'Save' }).click();

    //Click on the Employee List tab to display list of the records
    // await page.getByRole('link',{name:'Employee List '}).click();
    //await page.locator('//a[normalize-space()="Employee List"]').click();
});