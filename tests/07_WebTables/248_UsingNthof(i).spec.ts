import {test,expect} from '@playwright/test'
test('Verify Webtable 1 Example',async({page})=>
{
await page.goto('https://awesomeqa.com/webtable1.html');
//table[@summary="Sample Table"] By Xpath
//  table[summary="Sample Table"] By CSS Selector CSS selector does not have // and @, so // is used here for commenting it out
const rows=page.locator('table[summary="Sample Table"] tbody tr');
const rowCount = await rows.count();
console.log(rowCount);
for(let i=0;i<=rowCount-1;i++) //as you are indexing means counting from 0 so the rowCOunt will be rowCount-1 for calculations only means it will go to 0,1,2,3 
{
    const rowsData = await rows.nth(i).locator('td').allInnerTexts(); //nth(i) gives fiest <tr> element
    console.log(`Row ${i + 1}:`, rowsData);
}



});