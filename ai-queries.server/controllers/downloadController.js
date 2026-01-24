const { EOF } = require("dns");
//const schedule = require("node-schedule");
const loggerService = require("../services/loggerService");
const puppeteer = require('puppeteer');


class DownloadController {
  constructor() {
    this.yesterday = this.getFormattedYesterdayDate()
  }
  async startDownload(req, res){


      // Launch the browser (set headless to false so you can see the browser, or true for headless mode)
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      
      // Go to the login page
      await page.goto('https://u100000443.opil.omnitelecom.com/', {
        waitUntil: 'networkidle2'
      });
      
      // Replace '#username' with the actual selector for the username field
      await page.waitForSelector('#username');
      await page.type('#username', 'rtemb');
    
      // Replace '#password' with the actual selector for the password field
      await page.waitForSelector('#password');
      await page.type('#password', 'rtemb'); 
    
      // Replace '#login-button' with the actual selector for the login button
      //await page.click('#login-button');
      await page.click('.mdl-button__ripple-container');

      /*******************************************************************/
      await page.waitForSelector('button.mdl-button.mdl-js-button.mdl-button--icon.btn.btn-default.dropdown-toggle');
      console.log('this.yesterday============>',this.yesterday);
      await page.goto('https://u100000443.opil.omnitelecom.com/cdr/', {
        waitUntil: 'networkidle2'
      });

    /****************************************************************/
      // for single element with this.yestarday string in it - works!
      await page.waitForSelector(`[date^="${this.yesterday}"]`);
      await page.click(`[date^="${this.yesterday}"]`);
      /********************************************************/

      const elements = await page.$$(`[date^="${this.yesterday}"]`);

      console.log(`Found ${elements.length} element(s).`);
      for (const element of elements) {
        // 2) Check the text content (optional)
        const textContent = await element.evaluate(el => el.textContent);
        console.log('Text content:', textContent);
      
        // 3) Wait for the new popup/tab
        const [popupTarget] = await Promise.all([
          // Listen once for a new target (i.e., popup/window/tab) to be created
          new Promise(resolve => browser.once('targetcreated', resolve)),
          // Click the specific element we’re looping over
          element.click(),
        ]);
      
        // 4) Get a reference to the newly opened page
        const newPage = await popupTarget.page();
        console.log('Newly opened page:', newPage.url());
      
        // 5) Interact with the new page
        await newPage.waitForSelector('button[title="Download"]', { visible: true });
        await newPage.click('button[title="Download"]');
      
        // (Optional) close the popup if needed
        await newPage.close();
      }
  /***********************************************************************************/

// await page.waitForFunction(() => {
//   const btn = document.querySelector('button.play[title="Open Recordings"]');
//   return btn && btn.offsetParent !== null; // is visible
// });
// },1000)

/******************************************* works but gives the wrong button ***************************************/
  // await page.waitForSelector(
  //   'button.mdl-button.mdl-js-button.mdl-button--raised.mdl-js-ripple-effect.play'
  // );
  // await page.click('button.mdl-button.mdl-js-button.mdl-button--raised.mdl-js-ripple-effect.play')
  /************************************************************************************ */

  // console.log('page:', page);              // See if it prints a big Puppeteer Page object or something else
  // console.log('page.$x:', page.$x);        // Should be a function in Puppeteer 24.2.0
  // console.log('typeof page.$x:', typeof page.$x);
  


  // const [btn] = await page.$x(`
  //   //button[contains(@class,"mdl-button--raised") 
  //      and contains(@class,"play")
  //      and .//i[contains(@class,"material-icons") and text()="save"]
  //   ]`);
  //   if (!btn) throw new Error('Could not find the "save" button!');
  //   await btn.click();
    

//setTimeout(async()=>{
  console.log('waiting!2');

  // await page.waitForSelector(
  //   'button.mdl-button.mdl-js-button.mdl-button--raised.mdl-js-ripple-effect.play'
  // );
  // await page.click('button.mdl-button.mdl-js-button.mdl-button--raised.mdl-js-ripple-effect.play')

  // await page.waitForSelector('button.play[onclick*="download=True"]', { visible: true });

  // await page.click('button.play[onclick*="download=True"]');
  

// await page.waitForSelector(
//   'td > button.mdl-button.mdl-js-button.mdl-button--raised.mdl-js-ripple-effect.play[title="Download"]',
//   { visible: true }
// );
// await page.click(
//   'td > button.mdl-button.mdl-js-button.mdl-button--raised.mdl-js-ripple-effect.play[title="Download"]'
// );

// await page.waitForSelector('#cdr_table > tbody > tr:nth-child(1) > td:nth-child(3) > button');
// await page.click('#cdr_table > tbody > tr:nth-child(1) > td:nth-child(3) > button');

// If the button has title="Download"
  // await page.waitForSelector(
  //   '#cdr_table tr td button[title="Download"]'
  // );
  // await page.click(
  //   '#cdr_table tr td button[title="Download"]'
  // );

  // Make sure the row/cell you want is genuinely the first/third
// in the DOM’s <tbody>, not a header row or a hidden row
// Looks for any <button> inside #cdr_table that has these classes 
// and title="Download"



// await page.waitForXPath('/html/body/main/section/table/tbody/tr[1]/td[3]/button');

// // Get the first matching node handle
// const [btn] = await page.$x('/html/body/main/section/table/tbody/tr[1]/td[3]/button');
// if (!btn) {
//   throw new Error('Could not find the button at XPath /html/body/main/section/table/tbody/tr[1]/td[3]/button');
// }

// Click it
//await btn.click();

// await page.waitForSelector('button[title="Download"]', { visible: true });
// await page.click('button[title="Download"]');

// const downloadButtons = await page.$$('button[title="Download"]');
// // Click the first
// await downloadButtons[0].click();

// await page.waitForSelector('button[onclick*="day=10&month=02&year=2025"]', { visible: true });
// await page.click('button[onclick*="day=10&month=02&year=2025"]');

// Instead of click:
// Then interact
// await Promise.all([
//   page.waitForNavigation(),
//   page.click('[date^="10/02/25"]')
// ]);


// await page.waitForSelector(
//   'button.mdl-button.mdl-js-button.mdl-button--raised.mdl-js-ripple-effect.play[data-upgraded=",MaterialButton,MaterialRipple"]',
//   { visible: true,
//     timeout: 10000 // 10 seconds, if needed
//    },
  
// );
// await page.click(
//   'button.mdl-button.mdl-js-button.mdl-button--raised.mdl-js-ripple-effect.play[data-upgraded=",MaterialButton,MaterialRipple"]'
// );


// const allDownloadButtons = await page.$$('button[title="Download"]');
// console.log('Found', allDownloadButtons.length, 'buttons with title="Download"');
// 1. Start listening for a new page (popup) before you click


/**************************************************************/
// const [popupTarget] = await Promise.all([
//   new Promise(resolve => browser.once('targetcreated', resolve)),
//   page.click(`[date^="${this.yesterday}"]`),
// ]);
// const newPage = await popupTarget.page();

// console.log('newPage====>',newPage);


// // Now interact with newPage
// await newPage.waitForSelector('button[title="Download"]', { visible: true });
// await newPage.click('button[title="Download"]');
/****************************************************************/




// await page.waitForSelector('button[onclick*="download=True"]', {
//   visible: true,
//   timeout: 10000 // 10 seconds, if needed
// });;
// await page.click('button[onclick*="download=True"]');

// await page.waitForSelector(
//   'button.mdl-button.mdl-js-button.mdl-button--raised.mdl-js-ripple-effect.play[title="Download"]',
//   { visible: true }
// );
// await page.click(
//   'button.mdl-button.mdl-js-button.mdl-button--raised.mdl-js-ripple-effect.play[title="Download"]'
// );
//<i class="material-icons">save</i>


//},5000)
 // const buttons = await page.$$('[date^="09/02/25"]');
// for (const button of buttons) {
//   setInterval(async()=>{
//     await button.click();
//     console.log('waiting!2');
//       await page.click('button.mdl-button.mdl-js-button.mdl-button--raised.mdl-js-ripple-effect.play')
//       'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect play'
//       'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect play'
//     },4000)
//   console.log('do some logic!');
  
// }
  
  //   // await page.click('button.mdl-button.mdl-js-button.mdl-button--icon.btn.btn-default.dropdown-toggle');    
  //   await page.waitForSelector('button.mdl-button.mdl-js-button.mdl-button--icon.btn.btn-default.dropdown-toggle');
  //   const allDropdownButtons = await page.$$('button.mdl-button.mdl-js-button.mdl-button--icon.btn.btn-default.dropdown-toggle');

  //   if (allDropdownButtons.length < 3) {
  //     throw new Error('Could not find three dropdown buttons on the page!');
  //   }
  
  //   // The array is zero-based, so [2] is the third
  //   await allDropdownButtons[2].click();
  // },2000)
 // console.log('weakup!');
  


      // await page.click('button .material-icons');

      // await page.click('button.mdl-button.mdl-button--icon.btn.btn-default.dropdown-toggle');

     // await page.click('.material-icons');
      //await page.click('.mdl-button');
    
      // Wait for navigation or a specific element that indicates you have logged in
     // await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // (Optional) Take a screenshot after login for verification
     // await page.screenshot({ path: 'after-login.png' });
    
      // You can now continue automation in the logged-in area
      // ...
    
      // Close the browser when done
     // await browser.close();
      res.end()
    //})();
  }




   // gets today with format dd/mm/yy
  getFormattedDate() {
    const today = new Date();
    
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2); // last two digits of the year
    
    return `${day}/${month}/${year}`;
  }
    // gets yesterday with format dd/mm/yy
  getFormattedYesterdayDate() {
    // Create a Date object for today
    const yesterday = new Date();
    
    // Subtract 1 day
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Extract day, month, and last two digits of the year
    const day = String(yesterday.getDate()).padStart(2, '0');
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const year = String(yesterday.getFullYear()).slice(-2);
    
    // Format: DD/MM/YY
    return `${day}/${month}/${year}`;
  }


}

module.exports = new DownloadController();
