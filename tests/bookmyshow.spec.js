const { test, expect } = require('@playwright/test');

test('Checking if tickets are available for a film', async ({page}) => {
    await page.goto("https://in.bookmyshow.com/movies/bengaluru/coolie/ET00395817")

const button = page.locator('button:has-text("Book tickets")').first();

  if (await button.isVisible()) {
    console.log('Tickets available now');
        await button.click();
        //await page.waitForSelector('.sc-8f9mtj-0.sc-8f9mtj-1.sc-1vmod7e-0.cUKDnO.hxNpBB.fiWmpq', { state: 'visible' });
        const continueButton=await page.locator('div.sc-ttkokf-2.sc-ttkokf-3.bIIppr.hIYQmz');
        await continueButton.click();
        //await page.waitForSelector('.sc-ttkokf-2 sc-ttkokf-3 bIIppr hIYQmz', { state: 'visible' });
        //await page.click(".sc-ttkokf-2 sc-ttkokf-3 bIIppr hIYQmz");


    }
    else {
        console.log("Hold up mf");
    }
    await page.close();
});