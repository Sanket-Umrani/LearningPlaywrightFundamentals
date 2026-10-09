import{test,expect,Locator}from'@playwright/test';
import dotenv from "dotenv";
dotenv.config(); //credentials live in .env which is made gitignored
const upload_dir=process.env.TTA_UploadPhoto;

    test.use(
    {
        storageState : './TTALogin-session.json'
    });
    test('Verify Profile Photo Upload Feature by loggin into TTA',async({page})=>{
        await page.goto('https://app.thetestingacademy.com/student/my-process');
        console.log(page.url());
await page.getByRole('button',{name:'Close'}).click();
//await expect(page.getByRole('button',{name:'Close'})).toBeHidden();
await page.getByRole('link',{name:'Settings'}).click();
await page.waitForTimeout(1000);
await page.locator('#avatar-upload').setInputFiles(upload_dir!);
await page.waitForTimeout(5000);
await page.pause();

});