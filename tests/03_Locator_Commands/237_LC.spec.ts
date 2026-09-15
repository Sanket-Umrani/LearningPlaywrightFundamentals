import {test,expect} from 'playwright/test'

test('Verify X',async({page})=>{
       await page.goto(
        "https://app.thetestingacademy.com/playwright/multiple_element_filter"
    );

})