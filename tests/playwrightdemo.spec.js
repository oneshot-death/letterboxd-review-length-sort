// playwrightdemo.spec.js

const { test, expect } = require('@playwright/test');

test('Visit Facebook login page and verify title', async ({ page }) => {
  // Navigate to Facebook login page
  await page.goto('https://www.facebook.com/');

  const pageTitle=page.title();

  await expect(page).toHaveTitle(/Facebook/);
  page.close();

});