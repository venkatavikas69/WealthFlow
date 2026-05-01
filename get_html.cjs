const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', {waitUntil: 'networkidle0'});
  const html = await page.$eval('#root', el => el.innerHTML);
  console.log(html.substring(0, 2000));
  await browser.close();
})();
