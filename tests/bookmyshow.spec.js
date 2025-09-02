require('dotenv').config();
const { test, expect } = require('@playwright/test');
const nodemailer = require('nodemailer');
const bookingPage="https://in.bookmyshow.com";

const fs = require("fs");

function getConfig() {
  const data = fs.readFileSync("config.json", "utf-8");
  return JSON.parse(data);
}

const config = getConfig();

function saveMovieUrl(movieName, url) {
  const file = "movies.json";
  let data = {};

  if (fs.existsSync(file)) {
    data = JSON.parse(fs.readFileSync(file, "utf-8"));
  }

  data[movieName] = url;
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function getMovieUrl(movieName) {
  const file = "movies.json";
  if (!fs.existsSync(file)) return null;

  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  return data[movieName] || null;
}

function checkMail(movieName) {
  const file="movies.json"
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));
  const str=movieName+"mail";
  if (!data[str]) {
    data[str]=0;
    fs.writeFileSync(file,JSON.stringify(data, null, 2))
    return 0;
  }
  else {
    if (data[str]==0) {
      return 0
    }
    else {
      return 1;
    }
  }
}

test('Checking if tickets are available for a film', async ({page}) => {
  let filmUrl=getMovieUrl(`${config.movie}`)
  if (!filmUrl) {
    await page.goto(bookingPage);
    await page.locator('input[placeholder="Search for your city"]').fill(`${config.location}`);
    await page.locator("xpath=/html/body/div[1]/div/div[2]/div/div/div[1]/div[2]/div[1]/div").click() //clicks the first input
    await page.locator("xpath=/html/body/div[1]/div/div[2]/div[3]/div[1]/div[2]/div/div/div/div[1]/div[1]/div[2]/a/div").click() //see all
    const movieLocator = page.locator(`a:has-text("${config.movie}")`).first();

    // keep scrolling until the element is visible
    while (!(await movieLocator.isVisible())) {
      await page.mouse.wheel(0, 300); // scroll down a bit
      await page.waitForTimeout(500); // small delay (so it feels natural)
    }

    await movieLocator.click();
    filmUrl=page.url()
    saveMovieUrl(`${config.movie}`,filmUrl)
  }
  else {
    await page.goto(filmUrl)
  }
  const button = await page.locator('button:has-text("Book tickets")').first()
  let mailFlag
  if (await button.isVisible()) {
    console.log('Tickets available now');
    mailFlag=checkMail(`${config.movie}`)
    }
    else {
        console.log("Hold up mf");
    }
  if (mailFlag==0) {
    await sendEmailNotification()
    const file='movies.json'
    const data=JSON.parse(fs.readFileSync(file,"utf-8"))
    const str=`${config.movie}`+ "mail"
    data[str]=1
    fs.writeFileSync(file,JSON.stringify(data, null, 2))
  }
  await sendEmailNotification()
  await page.close()
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
    to: process.env.EMAIL_USER,
    subject: 'Tickets are now available!',
    text: 'The tickets for the film are now available. Please check it out on BookMyShow.'
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}
