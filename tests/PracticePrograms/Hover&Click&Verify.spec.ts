import{test,expect,Locator} from '@playwright/test';
test('Hover and Click and Verify',async({page})=>{
await page.goto('https://app.thetestingacademy.com/playwright/widgets/hover-menu');
await page.getByTestId('nav-add-ons').hover();
await page.getByRole('menuitem',{name:'Wi-Fi',exact:false}).click();
await expect(page.getByTestId('hover-output')).toBeVisible();
await expect(page.getByTestId('hover-output')).toContainText('Wi-Fi');
console.log(await page.getByTestId('hover-output').textContent());
await page.pause();
});
   


   