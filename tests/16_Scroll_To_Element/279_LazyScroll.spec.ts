import{test,expect} from'@playwright/test';
test.describe('Scroll To View-TTA',()=>{
test.beforeEach(async({page})=>{
    await page.goto('https://app.thetestingacademy.com/playwright/widgets/scroll');

});
test('Scroll To View',async({page})=>{
    //5th way to scroll is a lazy scroll where the  lazy list count grows past 10 count  once visible, similar to like Load More
//await page.locator('#section-lazy').scrollIntoViewIfNeeded();
 await page.getByTestId('section-lazy').scrollIntoViewIfNeeded();
      await page.getByTestId('lazy-list').scrollIntoViewIfNeeded();
         const list = page.locator('#lazy-list li');
      const initialCount = await list.count();
      console.log(initialCount);
      await page.pause();
    //    await list.last().scrollIntoViewIfNeeded();
    //    await expect.poll(async () => list.count(), {
    //      message: "expected_itmes > 10",
    //      timeout: 10_000
    //   }).toBeGreaterThan(initialCount);

    //   const finalCount = await list.count();
    //   console.log(finalCount);

    //   await page.waitForTimeout(5000);

//   console.log(await page.locator('#lazy-list li').count());
//from the list generated we need to reach till the end of the scrollable area to cover all the elements
//await list.last().scrollIntoViewIfNeeded();

// expect.poll(()=>list.count(),{
//      message: "expected_items > 10",
//          timeout: 10_000}).toBeGreaterThan(initialCount);
//            const finalCount = await list.count();
//       console.log(finalCount);

    //   await page.waitForTimeout(5000);
      /**
       expect.poll() repeatedly executes list.count().
It keeps polling until:
count > initialCount, or
10_000 ms timeout is reached.
If it times out, Playwright shows the custom message.
       */

});

});