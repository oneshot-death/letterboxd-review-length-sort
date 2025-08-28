require('dotenv').config();
const { test, expect } = require('@playwright/test');
const nodemailer = require('nodemailer');
const bookingPage="https://in.bookmyshow.com/movies/bengaluru/coolie/ET00395817";

test('Checking if tickets are available for a film', async ({page}) => {
    await page.goto(bookingPage);
    const split=bookingPage.split("/");
    const movie=split[5];
    const location=split[4];
    const capitalisedLocation=capitalizeFirstLetter(location);
const button = page.locator('button:has-text("Book tickets")').first();

  if (await button.isVisible()) {
    console.log('Tickets available now');
        await page.goto("https://www.district.in/");
        await page.locator("span.dds-text-lg").click();
        await page.getByPlaceholder("Search city, area or locality").fill(location);
        const locationButton=await page.locator(`button:has-text("${capitalisedLocation}")`).first();
        if (await locationButton.count()>0) {
          await locationButton.click();
        }
        else {
          console.log("Location not identified. Please ensure your location is clicked correctly from BMS before inputting the link");
        }
        await page.locator('div:has-text("Search for events, movies and restaurants") >> nth=6').click();
        await page.locator('button:has-text("Movies")').click();
        await page.locator('xpath=/html/body/div[2]/div/div/div/div/div[1]/div[1]/div/input').fill(movie); //used xpath
        await page.locator(`div:has-text("${movie}")`).first().click(); //not working rn

        //await sendEmailNotification();
        //await page.waitForSelector('.sc-ttkokf-2 sc-ttkokf-3 bIIppr hIYQmz', { state: 'visible' });
        //await page.click(".sc-ttkokf-2 sc-ttkokf-3 bIIppr hIYQmz");


    }
    else {
        console.log("Hold up mf");
    }
    await page.close();
});

function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}


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