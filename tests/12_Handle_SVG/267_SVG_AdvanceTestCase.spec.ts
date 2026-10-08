import{test,expect,Locator} from'@playwright/test';
test.describe('Advance SVG Test Cases Handle',()=>{
    const URL='https://app.thetestingacademy.com/playwright/widgets/svg'
    test.beforeEach(async({page})=>{
        await page.goto(URL);

    });
    test('Verify Multiple SVG elements',async({page})=>{
        const circleShape:Locator=page.locator('#circle-red');
        await circleShape.click();
        const results :string=await page.locator('#shapes-output').innerText();
        expect(results).toContain('Red circle');

        await page.getByRole('button',{name:/Q3 bar/}).click(); //Regex is utilized here /.../ to handle dynamic cases and also when Regex is used then no need of ''
await page.getByRole('radio',{name:'5 stars'}).click();
const allBars:Locator[]=await page.locator('.chart-svg .bar').all();
for(const bars of allBars)
{
const q = await bars.getAttribute('data-quarter');
            const h = await bars.getAttribute('height');
            console.log(q);
            console.log(h);
}

        await page.pause();

    });

});