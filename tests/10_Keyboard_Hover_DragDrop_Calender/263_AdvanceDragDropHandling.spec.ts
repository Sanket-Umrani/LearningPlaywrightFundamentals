import { test, expect, Locator } from '@playwright/test';
test('Adavance Drag and Drop Handling', async ({ page }) => {
    await page.goto('https://app.thetestingacademy.com/playwright/widgets/dnd');


    // const sourceColumn=page.locator('[data-status="todo"]');
    // const targetColumn=page.locator('[data-status="in-progress"]');
     
    // const sourceColumnTextList:Locator[] =await sourceColumn.locator('.column-head',{hasText:'Review PR #21 — flaky test fix'}).all();
    // // const targetColumnTextList:string= await targetColumn.locator('.column-head').innerText();

    // console.log('Source Column Text List is :'+sourceColumnTextList);
    // console.log('Target Column Text List is :'+targetColumnTextList);

    // await sourceColumn.getByTestId('card-review-pr-21').dragTo(targetColumn);
    // const movedCard = targetColumn.getByTestId('card-review-pr-21');
    // await expect(movedCard).toBeVisible();
    // console.log('Column In Progress text is :'+await page.getByTestId('col-in-progress').textContent());

    // await page.getByTestId('card-review-pr-21').dragTo(page.getByTestId('col-in-progress'));
    // //  await expect(page.getByTestId('card-review-pr-21')).toBeVisible();
    // console.log(await page.getByTestId('col-in-progress').textContent());

    // await page
    //     .getByTestId('card-review-pr-21')
    //     .dragTo(targetColumn);
    // const movedCard = targetColumn.getByTestId('card-review-pr-21');

    // await expect(movedCard).toBeVisible();

    //  await expect(page.locator('.column-head')).toContainText('Review PR #21 — flaky test fix');
    //  console.log('Column In Progress text is :'+await page.getByTestId('col-in-progress').textContent());
    //----------------------------------------------------------------------------------------------
    //Cards are made of multiple elements, so we need to make use of boundingbox() to get the coordinates of the source and target elements. Then we can use mouse events to perform the drag and drop action. 
      let source:Locator = page.locator('#card-write-spec');
    const sBox = (await source.boundingBox())!;

    let target: Locator = page.locator('[data-status="in-progress"]');
    const tBox = (await target.boundingBox())!;

    await page.mouse.move(sBox.x + sBox.width / 2, sBox.y + sBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(tBox.x + tBox.width / 2, tBox.y + tBox.height / 2, { steps: 10 });
    await page.mouse.up();
    await page.pause();
});