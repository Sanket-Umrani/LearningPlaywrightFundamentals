import{test,expect,Locator}from'@playwright/test';
test('Hover and Click and Verify',async({page})=>{
    test.setTimeout(60000); // 60 seconds
    await page.goto('https://the-internet.herokuapp.com/drag_and_drop');
    await page.locator('#column-a').dragTo(page.locator('#column-b'));
    await expect(page.locator('#column-b')).toContainText('A');
    await expect(page.locator('#column-a')).toContainText('B');
    console.log('Column B text is :'+await page.locator('#column-b').textContent());
    console.log('Column A text is :'+await page.locator('#column-a').textContent());

    await page.pause();
});