import { test, expect, Locator } from '@playwright/test';
test.describe('File Upload Demo - TestingAcademy', () => {

   test.beforeEach(async ({ page }) => {
      await page.goto('https://app.thetestingacademy.com/playwright/widgets/upload-download');
   });

   test('demo: Download setInputFiles', async ({ page }) => {


         const [staticDownload] = await Promise.all([
               page.waitForEvent('download'),
               page.getByTestId('download-static').click()
               /**
                * Step 1: Start listening for download
                  Step 2: Click button
                  Step 3: Capture download event
                */
         ]);

         await staticDownload.saveAs('./out/'+ staticDownload.suggestedFilename());

//[staticDownload]: It's a Playwright Download object. which means Promise.all() returns an array containing the results of all promises.
//waitForEvent('download') returns a Download object and click() doesn't return anything useful
//suggestedFilename() if browser downloads reports.pdf then suggestedFilename() will return Report.pdf
//saveAs()saves the downloaded file to your desired location.playwright saves the file as ./out/report.pdf
/**
 * Playwright starts listening for downloads.
Button is clicked.
Browser downloads report.pdf.
Playwright captures the download.
download now represents that file
 */
/**
 * 
 * page.waitForEvent('download')
          │
          ▼
    Listening
          │
          │
          ├──────────────┐
          │              │
          ▼              ▼
     Click Button    Download Starts
          │              │
          └──────┬───────┘
                 ▼
         Download Object
                 │
                 ▼
          saveAs(...)
 */
/**
 * Recommended Playwright Pattern
 * const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.getByTestId('download-static').click()
]);

console.log(download.suggestedFilename());

await download.saveAs(
  `./out/${download.suggestedFilename()}`
);
 */




   });

});