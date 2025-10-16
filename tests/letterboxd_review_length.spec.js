const { test, expect } = require('@playwright/test');
const { count } = require('console');

async function longReviewChecking(page) {
  const moreButton=await page.getByText("more")
  for (let i=0;i<await moreButton.count()-1;i++) {
    await moreButton.nth(i).click()
    console.log(await moreButton.first().textContent())
  }
}

test('has title', async ({ page }) => {
  await page.goto("https://letterboxd.com/", { waitUntil: 'domcontentloaded' })
  const search=await page.locator("id=search-q")
  await search.fill("one battle")
  await search.press("Enter")
  await page.locator(".film-title-wrapper").first().click()
  await page.locator(".all-link").first().click()
  await longReviewChecking(page)
});