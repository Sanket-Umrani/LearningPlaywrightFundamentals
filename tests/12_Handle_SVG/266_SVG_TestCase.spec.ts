import{test,expect,Locator} from '@playwright/test';
test.describe('Handle SVG Elements',()=>{
const URL='https://www.flipkart.com/search';
    test.beforeEach(async({page})=>{
        console.log('Before Running any tests');
        await page.goto(URL);

    });

    test('Verify SVG Elements',async({page})=>{
        await page.locator('input[name="q"]').fill("macmini");
       const svgElements:Locator=page.locator('svg');
       await svgElements.first().click();
    await page.waitForLoadState('networkidle');
    //Print the searched results 
    const filteredResults:Locator=page.locator("//div[contains(@data-id,'MPC')or contains(@data-id,'CPU') or contains(@data-id,'COM') or contains(@data-id,'AI')]/div/a[2]");
const count:number=await filteredResults.count();
for(let i=0;i<count;i++)
{
    const title:string|null =await filteredResults.nth(i).textContent();
    console.log(title);
}
    await page.pause();
    });

});