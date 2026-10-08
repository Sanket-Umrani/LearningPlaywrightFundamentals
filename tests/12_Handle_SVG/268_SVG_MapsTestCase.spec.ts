import{test,expect,Locator} from'@playwright/test';
test.describe('Validate SVGs on Maps',()=>{
    const URL='https://simplemaps.com/svg/country/in';
    test.beforeEach(async({page})=>{
        await page.goto(URL);
});
test('Locate SVG on the Maps',async({page})=>{
    const states: Locator[] =await page.locator("//div[@id='admin1_map_inner']//*[name()='svg']//*[name()='path' and contains(@class,'sm_state')]").all();
  for(const state of states){
            const classState = await state.getAttribute("class");
            console.log(classState);
            if (classState?.includes("INUP")) {
                state.click();
            }
        }



        await page.pause();
});


});