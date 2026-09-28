import {test,expect} from '@playwright/test'

test('Basic Verify how to handle multiple elements',async({page})=>{
    await page.goto("https://app.thetestingacademy.com/playwright/multiple_element_filter");
    const InnerTexts:string[]=await page.locator('a.list-group-item').allInnerTexts();
    console.log(InnerTexts.length);

    for (const link of InnerTexts)
    {
        console.log(link);
    }
    for(const linkText of InnerTexts)
    {
        if(linkText==='Forgotten Password')
        {
            page.getByText(linkText).first().click();
            //.first() is not mandatory but if getByText has multiple elements then iwant to click on first element
//page.getByText(linkText).nth(2).click();
// to select the second element from the list then we use nth(2)
        }
     
    }
    const allLinks=await page.locator('a.list-group-item').all();
    console.log(allLinks.length);
    for(const link of allLinks)
    {
        console.log(await link.getAttribute('href'));
    }

       await page.pause();
});

/**
 * Difference between below statements
 * const allLinks=await page.locator('a.list-group-item').all(); 
 * const allLinks: Locator[]=await page.locator('a.list-group-item').all();
 * In the second statement you explictly specify the return type Locator[]
 * both declarations produce the same runtime output; the explicit : Locator[] only makes the TypeScript type annotation visible instead of relying on inference.
 */