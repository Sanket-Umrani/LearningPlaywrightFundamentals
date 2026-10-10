import{test,expect}from'@playwright/test';
test.describe('Scroll To Element-TTA',()=>{
test.beforeEach(async({page})=>{
    await page.goto('https://app.thetestingacademy.com/playwright/widgets/scroll');

});
test('Scroll To View',async({page})=>{
    //1st Way to Scroll
    // await page.getByRole('button',{name:'Find deep anchor'}).scrollIntoViewIfNeeded();
    // await page.getByRole('button',{name:'Find deep anchor'}).click();
//2nd Way to Scroll is via JS Execute
await page.evaluate(()=>window.scrollBy(0,1500));
//3rd Way to Scroll-Jump to bottom
// await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
// //4th way to Scroll-Jump back to top
// await page.evaluate(()=>window.scrollTo(0,0));
await page.pause();


});
});