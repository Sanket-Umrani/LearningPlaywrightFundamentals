import{test,expect}from'@playwright/test';

test.describe('Verify Shadow DOM Elements',()=>{

test.beforeEach(async({page})=>{
const URL='https://app.thetestingacademy.com/playwright/widgets/shadow-dom';
await page.goto(URL);
});

test('Verify Input Details under Shadow DOM Root',async({page})=>{
    const card=page.getByTestId('card-account-card');
    await card.locator('input[name="email"]').fill('student@testingacademy.com');
    await card.locator('input[name="password"]').fill('PW');
    await card.getByRole('button',{name:'Submit'}).click();
    await expect(page.getByTestId('card-account-status')).toContainText('student@testingacademy.com');
     const cart = page.getByTestId('counter-cart');
      await cart.getByRole('button', { name: 'Increment' }).click();
      await cart.getByRole('button', { name: 'Increment' }).click();
      await expect(cart.getByTestId('counter-value')).toHaveText('5');

      page.getByTestId('nested-host');
      await page.getByTestId('card-inside-email').fill('pramod@thetestingacdemy.com');
      await page.getByTestId('card-inside-password').fill('pramod@123');
      await page.getByTestId('card-inside-submit').click();

      await page.pause();


});


});