import{test,expect,FrameLocator} from'@playwright/test';
test('IframeTestCase Verification',async({page})=>{
await page.goto('https://app.thetestingacademy.com/playwright/frames/');
//Single iframe — fill the embedded form
let vehicleFrame: FrameLocator=page.frameLocator('#frame-one');
await vehicleFrame.locator('#RESULT_TextField-1').fill('Maruti Suzuki 800');
await vehicleFrame.locator('#RESULT_TextField-2').fill('SHREYAS UMRANI');
await vehicleFrame.locator('#RESULT_TextField-3').fill('2026');
await vehicleFrame.locator('#RESULT_RadioButton-1').selectOption('Sedan');
await vehicleFrame.locator('#RESULT_TextField-4').fill('2010');
await vehicleFrame.locator('#RESULT_TextArea-1').fill('Compact and Economical Car');
await vehicleFrame.getByText('Submit registration',{exact:true}).click();
let output = await vehicleFrame.locator("#vehicle-output").innerText();
  console.log(output);
  await page.pause();


});