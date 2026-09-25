import { test, expect } from "@playwright/test";


// Load the saved session from 243_SessionStorage.ts by running 243_SessionStorage.ts first
test.use(
    {
        storageState : './user-session.json'
    });

    test("go directly to dashboard — Test1", async ({ page }) => {
    await page.goto("https://app.wingify.com/#/dashboard?accountId=1281646");
    await expect(page).toHaveURL(/dashboard/);
    console.log("Dashboard loaded — no login needed ✅");
    await page.waitForTimeout(3000);
    
});

test("go directly to Web Experimentation — Test2", async ({ page }) => {
    await page.goto("https://app.wingify.com/#/web-experimentation?accountId=1281646");
    await expect(page).toHaveURL(/web-experimentation/);
    console.log("Web Experimentation Loaded — no login needed ✅");
    await page.waitForTimeout(3000);
    
});

test("go directly to Web Rollout — Test3", async ({ page }) => {
    await page.goto("https://app.wingify.com/#/deploy/experience/?accountId=1281646");
    await expect(page).toHaveURL(/deploy/);
    console.log("Web Rollout Loaded — no login needed ✅");
    await page.waitForTimeout(3000);
    
});