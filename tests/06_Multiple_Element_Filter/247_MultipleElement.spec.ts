import {test,expect, Locator} from '@playwright/test'

test('Basic Verify how to handle multiple elements',async({page})=>{
    await page.goto("https://app.thetestingacademy.com/playwright/multiple_element_filter");
    
    const allLinksText:Locator []=await page.locator('a.list-group-item').all(); //all() methods returns list of elements  in Locator Array
    console.log(allLinksText.length);
    for(const link of allLinksText)
    {
        console.log(await link.getAttribute('href'));
    }

       await page.pause();
});