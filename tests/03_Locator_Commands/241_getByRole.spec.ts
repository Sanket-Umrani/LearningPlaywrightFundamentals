import {test,expect} from 'playwright/test';

test("Verfiy the error message in the wingify free trial",async({page})=>{
       await page.goto("https://app.wingify.com/#/login");
       let username=page.getByRole("textbox",{name:"email"}); //here nwe are taling about the value of the RoleType and not exactly name attribute
       let password=page.getByRole("textbox",{name:"password"});
       await username.fill(process.env.VWO_TRIAL_USER!);
       await password.fill(process.env.VWO_TRIAL_PASS!);
       await page.pause();

});