const { test, expect } = require('@playwright/test');
const fs = require('fs');
test.setTimeout(120000)

async function longReviewChecking(page, minReviews = 5, reviewCount = 0) {
  const moreButtons = page.getByText('more');
  const total = await moreButtons.count();

for (let i = 0; i < total; i++) {
  const btn = moreButtons.nth(i);

  if (await btn.isVisible()) {
    await btn.click();
    await page.waitForTimeout(2000);
  } else {
    continue;
  }

  const parent = btn.locator('..');

  // extract the HTML to preserve <p> structure
  const reviewHTML = await parent.innerHTML();

  // replace <p>...</p> with line breaks, remove other tags (what concept is used here)
  let formattedText = reviewHTML
    .replace(/<\/p>\s*<p>/gi, '\n\n') // paragraph spacing
    .replace(/<\/?p[^>]*>/gi, '')     // remove p tags themselves
    .replace(/<br\s*\/?>/gi, '\n')    // line breaks
    .replace(/<[^>]+>/g, '')          // strip any remaining HTML
    .trim();

  // word count filter
  const wordCount = formattedText.split(/\s+/).filter(Boolean).length;
  const minWordCount = 100; // adjust threshold as you like

  if (wordCount < minWordCount) {
    console.log(`Skipped short review (${wordCount} words)`);
    continue;
  }

  if (formattedText && formattedText !== longReviewChecking.previousReview) {
    reviewCount += 1;
    longReviewChecking.previousReview = formattedText; //how does it store previous text?

    fs.appendFileSync(
      'reviews.txt',
      `\n--- Review ${reviewCount} (${wordCount} words) ---\n${formattedText}\n`,
      'utf8'
    );
    console.log(`Saved Review ${reviewCount}`);
  } else {
    console.log(`Skipped duplicate or empty review at index ${i}`);
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

  return reviewCount; //what is the purpose of this if return alraedy exists at the top
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