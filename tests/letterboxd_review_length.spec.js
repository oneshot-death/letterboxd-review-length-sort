const { test, expect } = require('@playwright/test');
const fs = require('fs');

async function longReviewChecking(page, minReviews = 5, reviewCount = 0) {
  const moreButtons = page.getByText('more');
  const total = await moreButtons.count();

  for (let i = 0; i < total-1; i++) {
    const btn = moreButtons.nth(i);
    //await btn.scrollIntoViewIfNeeded();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(200);
    } else {
      continue;
    }

    const parent = btn.locator('..'); 
    const reviewText = (await parent.textContent())?.trim() || '';

    if (reviewText && reviewText !== '' && reviewText !== longReviewChecking.previousReview) {
      reviewCount += 1;
      longReviewChecking.previousReview = reviewText; // storing last saved review

      fs.appendFileSync('reviews.txt', `\n--- Review ${reviewCount} ---\n${reviewText}\n`, 'utf8');
      console.log(`Saved Review ${reviewCount}`);
    } else {
      console.log(`Skipped duplicate/empty review at index ${i}`);
    }

    if (reviewCount >= minReviews) {
      console.log('Reached minimum reviews:', reviewCount);
      return reviewCount;
    }
  }

  if (reviewCount < minReviews) {
    const nextBtn = page.locator('.next');
    if (await nextBtn.count() && (await nextBtn.isVisible())) {
      await nextBtn.click();
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);
      return await longReviewChecking(page, minReviews, reviewCount);
    } else {
      console.log('No next button found or not visible; stopping.');
    }
  }

  return reviewCount;
}

longReviewChecking.previousReview = null;

test('review length', async ({ page }) => {
  // removing any existing output to start fresh
  try { fs.unlinkSync('reviews.txt') } catch (e) { /* ignore this */ }

  await page.goto("https://letterboxd.com/", { waitUntil: 'domcontentloaded' });
  const search = page.locator('#search-q');
  await search.fill("perfect days");
  await search.press('Enter');
  await page.locator('.film-title-wrapper').first().click();
  await page.locator('.all-link').first().click();

  const finalCount = await longReviewChecking(page, 5, 0);
  console.log('Done. Total reviews saved:', finalCount);
});
//try using with .reveal to check if that works. also with proper p tags