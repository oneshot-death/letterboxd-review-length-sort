const { test, expect } = require('@playwright/test');
const { count } = require('console');
var fs=require('fs')
let previous_review

async function longReviewChecking(page,minReviews,review_count,review_data) {
  var fs = require('fs');
  const moreButton=await page.getByText("more")
  previous_review=review_data
  
  for (let i=0;i<await moreButton.count()-1;i++) {
    if (await moreButton.nth(i).isVisible()) {
      await moreButton.nth(i).click()
    }
    else {
      break
    }
    let review_data=await moreButton.nth(i).locator("..").textContent()
    if (previous_review!=review_data) {
      review_count++
      fs.appendFileSync('reviews.txt', `\n--- Review ${i} ---\n${review_data.trim()}\n`);
    }
  
  }
  if (minReviews>review_count) {
    await page.locator('.next').click()
    await longReviewChecking(page,minReviews,review_count)
  }
}

test('review length', async ({ page }) => {
  await page.goto("https://letterboxd.com/", { waitUntil: 'domcontentloaded' })
  const search=await page.locator("id=search-q")
  await search.fill("perfect days")
  await search.press("Enter")
  await page.locator(".film-title-wrapper").first().click()
  await page.locator(".all-link").first().click()
  await longReviewChecking(page,5,0,null)
});