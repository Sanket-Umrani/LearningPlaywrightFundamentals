import { test, expect, Locator } from '@playwright/test';

test('Verify the TestCase', async ({ page }) => {
   await page.goto("https://app.thetestingacademy.com/playwright/webtable");

    // Code

   await page.pause();
});

/**
 Before Iterating through a web table
 * Count rows and columns
 * Build Dynamic XpathExpressions when demonstrating row and column indexes
 * Use XPathAxes such as following-sibling::td to read the related cells in the same row
 * Prefer Playwright locators like page.locator('table,tbody,tr',{hasText: '...'}) for readable row targetting
 * Use Locator ('td').nth(index) or allInnerTexts() to extract indiviual cells or full row data
 * Remember that XPath Table Indexes starts with 1 and  Playwright nth index start with 0
 */