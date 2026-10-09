import{chromium} from 'playwright';
import dotenv from"dotenv";
dotenv.config();
const TTA_Email=process.env.TTA_Email;
const TTA_Pass=process.env.TTA_Pass;
async function saveSession()
{
   let browser= await chromium.launch({headless:false});
   let context=await browser.newContext();
   let page=await context.newPage();
   await page.goto('https://app.thetestingacademy.com/login');
await page.getByPlaceholder('Enter your email address').fill(TTA_Email!);
await page.getByPlaceholder('Enter your password').fill(TTA_Pass!)
await page.getByRole('button',{name:"Continue",exact:true}).click();
await page.waitForTimeout(20000);
await context.storageState({ path: "./TTALogin-session.json" }); //storageState is a function of Context and not Page
console.log("Session saved to TTALogin-session.json ✅");

    await browser.close();

}
saveSession();