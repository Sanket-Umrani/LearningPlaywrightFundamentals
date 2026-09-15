import { test, expect } from '@playwright/test';

test("Navigating to the tta website", async ({ page }) => {
    await page.goto("https://app.thetestingacademy.com/playwright/");
});

test("BCP - in app.vwo.com two roles", async ({ browser }) => {
//use browser.newContext() if we want two or more  different users in the same test:
    let adminContext = await browser.newContext();
    let userContext = await browser.newContext();
    let guestConetxt = await browser.newContext();

    let adminPage = await adminContext.newPage();
    await adminPage.goto("https://app.thetestingacademy.com/playwright/");

    let userPage = await userContext.newPage();
    await userPage.goto("https://sdet.live");

    let guestPage = await guestConetxt.newPage();
    await guestPage.goto("https://scrolltest.com");


    await adminPage.close();
    await userPage.close();
    await guestPage.close();
    

});

/**
 * Browser
   │
   ├── newContext() 
   │       ↓
   │    Context          /// Context=Browser.newContext()
   │       │
   │       └── newPage()
   │              ↓
   │            Page     /// Page=Context.newPage()
   What if you want a new context while starting with page?
   A BrowserContext doesn't create another BrowserContext
   Again the control goes to the Browser and new Context is created with Browser.newContext()
   │
   └── newContext()
           ↓
        Context
           │
           └── newPage()
                  ↓
                Page
 */