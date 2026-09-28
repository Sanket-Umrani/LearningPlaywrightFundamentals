import{test,expect} from '@playwright/test'
test('Search a User from the Web Table',async({page})=>{
await page.goto('https://app.thetestingacademy.com/playwright/webtable');
// await page.locator('//td[text()="Rohan.Mehta"]/preceding-sibling::td/input').click();


//Pseudo Classes mostly used in Advanced Framework
 await page.locator("tr:has(td:text('Rohan.Mehta'))")
   .locator('input')
   .first()
   .click();
await page.waitForTimeout(5000);
});


