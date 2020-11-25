const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
var another = require('./need-functions.js');

var cron = require('node-cron');
 
cron.schedule('* * * * *', () => {
  getContent();
});

// --- start get content --- //
async function getContent() {
  console.log('running a task every minute.');

  const url = 'http://www.beer789.com/euro/football';

  puppeteer
    .launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
    .then(browser => browser.newPage())
    .then(page => {
      return page.goto(url).then(function () {
        return page.content();
      });
    })
    .then(html => {
      const $ = cheerio.load(html);
      const first = $('.LiveMarket').html();
      const second = $('.NonLiveMarket').html();
      const liveClass = '<div class="LiveMarket">' + first + '</div>';
      const nonLiveClass = '<div class="NonLiveMarket">' + second + '</div>';
      noiVinsmoke(liveClass + '' + nonLiveClass);

      // noiVinsmoke('live_market.html', liveClass);
      // noiVinsmoke('non_live_market.html', nonLiveClass);
    })
    .catch(console.error);
}
// --- end get function --- //

// --- start write file --- //
async function noiVinsmoke(obOne) {
  const fileName = 'index.html';
  const rsOne = await another.createFile(fileName);

  if (rsOne) {
    const rsTwo = await another.writeDataToJSONFile(fileName, obOne);
    console.log(rsTwo);
    // process.exit();
  }
}
// --- end write file --- //