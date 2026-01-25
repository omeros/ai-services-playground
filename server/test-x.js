const puppeteer = require('./node_modules/puppeteer');
console.log(puppeteer.version); 

(async () => {
  // const browser = await puppeteer.launch();
  // const realPage = await browser.newPage();

  // console.log("Type of realPage:", realPage.constructor.name); // Should say "CDPPage" or "Page"
  // console.log("typeof realPage.$x:", typeof realPage.$x);      // Should say "function"
  // console.log('page.$x:', realPage);        // Should be a function in Puppeteer 24.2.0


  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  console.log('Puppeteer version:', puppeteer.version);
  console.log('Type of page:', page.constructor.name);
  console.log('Does page.waitForXPath exist?', typeof page.waitForXPath);

  await browser.close();
})();
