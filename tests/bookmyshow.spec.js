require('dotenv').config();
const { test, expect } = require('@playwright/test');
const nodemailer = require('nodemailer');

test('Checking if tickets are available for a film', async ({page}) => {
    await page.goto("https://in.bookmyshow.com/movies/bengaluru/coolie/ET00395817")

const button = page.locator('button:has-text("Book tickets")').first();

  if (await button.isVisible()) {
    console.log('Tickets available now');
        await button.click();
        //await page.waitForSelector('.sc-8f9mtj-0.sc-8f9mtj-1.sc-1vmod7e-0.cUKDnO.hxNpBB.fiWmpq', { state: 'visible' });
        const continueButton=await page.locator('div.sc-ttkokf-2.sc-ttkokf-3.bIIppr.hIYQmz');
        await continueButton.click();
        await sendEmailNotification();
        //await page.waitForSelector('.sc-ttkokf-2 sc-ttkokf-3 bIIppr hIYQmz', { state: 'visible' });
        //await page.click(".sc-ttkokf-2 sc-ttkokf-3 bIIppr hIYQmz");


    }
    else {
        console.log("Hold up mf");
    }
    await page.close();
});

async function sendEmailNotification() {
  
  let transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS  
    }
  });


  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,  // Replace with ur email
    subject: 'Tickets are now available!',
    text: 'The tickets for the film are now available. Please check it out on BookMyShow.'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}