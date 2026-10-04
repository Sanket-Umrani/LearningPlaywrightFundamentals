import{test,expect,FrameLocator} from'@playwright/test';
test('MultiFrame Verification',async({page})=>{
await page.goto('https://app.thetestingacademy.com/playwright/frames/multi-frames');
let mainFrame:FrameLocator=page.frameLocator('[name="main"]');
const headerText=await mainFrame.locator('h2').innerText();
console.log(headerText);

let allFrames=await page.locator('//frames').all();
console.log('Total Frames on the page are : '+allFrames.length);
for (const frame of allFrames) {
        console.log(await frame.getAttribute('name'), ': ', await frame.getAttribute('src'));

    }
    let sideFrame:FrameLocator=page.frameLocator('[name="side"]');
    const sideText=await sideFrame.locator('h3').innerText();
    console.log(sideText);

    let footerFrame=page.frameLocator('[name="footer"]');
    console.log(footerFrame.getByText('The Testing Academy'));


});