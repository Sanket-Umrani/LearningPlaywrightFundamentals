// import{test,expect,Locator} from'@playwright/test'

// test('Verify OrangeHRM Employee Add,Search From List,Delete',async({page})=>{
//     await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
//     await page.locator('input[placeholder="Username"]').fill(process.env.ORANGEHRM_USER!);
//     await page.locator('input[placeholder="Password"]').fill(process.env.ORANGEHRM_PASS!);
//     await page.locator('button[type="submit"]').click();
//     await page.waitForTimeout(5000);
    

//     //Navigate to PIM and click on it
//    await page.locator('//span[text()="PIM"]').click();

// //       //Click on the Employee List tab to display list of the records
//     await page.locator('//a[normalize-space()="Employee List"]').click();

//       //Add an Employee 
//       await page.locator('.orangehrm-paper-container').filter({hasText:' Add '}).click();
// await page.locator('//a[normalize-space()="Add Employee"]').click();
// await page.getByPlaceholder('First Name').fill('TEKNAS');
// await page.getByPlaceholder('Last Name').fill('INARMU');
//  //await page.locator('input.oxd-input oxd-input--active').first().fill('105');
//  await page.locator('.oxd-form-actions').filter({hasText:' Save '}).click();

//  await page.waitForTimeout(5000);


//     // Search Employee
//     const name='TEKNAS';

//     await page.locator('.oxd-autocomplete-wrapper').first().locator('input').fill(name);
//     //Search 
//     await page.locator('button[type="submit"]').click();

// //     //Deleting the filtered record
// //     await page.locator('.oxd-icon bi-trash').click();
// //     await page.waitForTimeout(2000);
// //     await page.locator('.oxd-icon bi-trash oxd-button-icon').filter({hasText:' Yes, Delete '}).click();
// //  //Success Message
// //  await expect(page.getByText('Successfully Deleted')).toBeVisible();

// await page.pause();
// });