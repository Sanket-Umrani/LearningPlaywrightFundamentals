import{test,expect} from'@playwright/test';
test('Custom Dropdown',async({page})=>{
await page.goto('https://app.thetestingacademy.com/playwright/tables/dropdowns');
await page.getByTestId('lang-trigger').click();
await page.getByRole('option',{name:'JavaScript'}).click();
await page.locator('#framework-trigger').click();
await page.getByRole('option',{name:'Svelte'}).click();
await page.getByTestId('experience-trigger').click();
await page.getByText('Mid-level (4-6 years)',{exact:true}).click();


});