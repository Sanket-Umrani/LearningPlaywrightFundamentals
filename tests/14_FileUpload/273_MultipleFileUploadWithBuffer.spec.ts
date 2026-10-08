import{test}from'@playwright/test';

test.describe('Verofy Multiple FIle Upload',()=>{
test.beforeEach(async({page})=>{
await page.goto('https://www.patternfly.org/components/file-upload/multiple-file-upload/');

});
test('Locate FileUpload and Download',async({page})=>{
page.locator('.pf-v6-c-multiple-file-upload input').setInputFiles([{
                name: 'file1.jpg',
                mimeType: 'image/jpeg',
                buffer: Buffer.from('image from thetestingacademy code')
            },
            {
                name: 'file2.jpg',
                mimeType: 'image/jpeg',
                buffer: Buffer.from('this is test')
                //Playwright creates virtual files in memory from the buffers and uploads them directly to the browser. No physical files need to exist on disk.
            }

            ]);
            //await page.locator('.pf-v6-c-button.pf-m-secondary').click();
                 await page.pause();
});
});