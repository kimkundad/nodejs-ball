const http = require('http');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const EventEmitter = require('events');
const mysql = require('mysql');
var moment = require('moment-timezone');
var another = require('./need-functions.js');
// another.nvsNeedFile();

var dbObject = require('./config.json');

const express = require('express')
const app = express()

var port    = process.env.PORT || 3000;



class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter();
myEmitter.setMaxListeners(15);

const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e-6;
const time = process.hrtime();

var hostName = 'beer789.com';
var url = 'http://www.beer789.com/euro/football';

var connection = mysql.createConnection({
  host: dbObject.database.host_name,
  database: dbObject.database.db_name,
  user: dbObject.database.db_username,
  password: dbObject.database.db_password
});

connection.connect(async function (err) {
  if (err) {
    const createdAt = another.createdAt();
    await another.nvsOpenAndAppendFile('log.html', createdAt + ' : Main error: Cannot connect DB : ' + err.message + '<br>\n');
    process.exit();
  } else {
    // ----- start check host ----- //
    var reqOne = http.request({ method: 'HEAD', timeout: 5000, host: hostName, port: 80, path: '/' }, async (r) => {
      const sttClass = JSON.stringify(r.statusCode);
      // console.log(sttClass);
      sttCodeOne = parseInt(sttClass, 10);

      if (sttCodeOne > 0 && sttCodeOne < 400) {
        // find scraping_status 0
        var sqlFDir = "SELECT dir_name, created_at FROM ffp_list WHERE scraping_status='0' ORDER BY dir_name DESC LIMIT 1";
        connection.query(sqlFDir, async (err, result, fields) => {
          if (err) {
            const createdAt = another.createdAt();
            await another.nvsOpenAndAppendFile('log.html', createdAt + ' : Main SELECT dir_name error DB : ' + err.message + '<br>\n');

           // connection.end();
           // process.exit();
          } else {
            if (result.length == 0) {
              getContent();
            } else {
             // connection.end();
            //  process.exit();
            }
          }
        });
      } else {
       // connection.end();
       // process.exit();
      }
    });
    reqOne.end();

    reqOne.on('timeout', () => {
      // reqOne.abort();

     // connection.end();
    //  process.exit();
    });
    // ----- end check host ----- //
  }
});

app.get('/', (req, res) => {
  let scrape = async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.content();
    await browser.close();

    if (html) {
      console.log('Yes, has html');
      
      const $ = cheerio.load(html);
      
      noiVinsmoke($);
    
      await browser.close();
    } else {

      await browser.close();
    }
    return html;
    
    }
    scrape().then((value) => {
      res.json({"foo": value});
  });
  
})



// --- start get content --- //
function getContent() {

  
  
  puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] }).then(async browser => {
    return 'Yes, has html';
    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0);

    // --- start log error --- //
    // var theTempValue;
    // page.on('error', async function (err) {
    //   theTempValue = err.toString();
    //   await another.nvsOpenAndAppendFile('log.html', 'Main error: ' + theTempValue + '<br>\n');
    // });
    // --- end log error --- //

    await page.goto(url);

    const html = await page.content();
   // console.log(html);
    
    res.json(html)

    if (html) {
      console.log('Yes, has html');
      
      const $ = cheerio.load(html);
      
      noiVinsmoke($);

      /*
      const diff = process.hrtime(time);
      // const nano = diff[0] * NS_PER_SEC + diff[1];
      const milli = (diff[0] * NS_PER_SEC + diff[1])  * MS_PER_NS;
      const totalTime = await another.nvsMillisToMinutesAndSeconds(milli);
      console.log(totalTime);
      */
    
      await browser.close();
    } else {
      /*
      const diff = process.hrtime(time);
      // const nano = diff[0] * NS_PER_SEC + diff[1];
      const milli = (diff[0] * NS_PER_SEC + diff[1])  * MS_PER_NS;
      const totalTime = await another.nvsMillisToMinutesAndSeconds(milli);
      console.log(totalTime);
      */

      await browser.close();
    }
  })
    .catch(async (err) => {
      // console.log(err);
      const createdAt = another.createdAt();
      await another.nvsOpenAndAppendFile('log.html', createdAt + ' : Main puppeteer.launch error : ' + err.message + '<br>\n');

     // connection.end();
     // process.exit();
    });
}
// --- end get content --- //

// --- start write file --- //
async function noiVinsmoke($) {
  var setList = [];

  $('.NonLiveMarket .MarketT').each((i, ele) => {
    var topHead = $(ele).find('.MarketHd .SubHead span').html();

    var dataList = [];
    var marketBdHtml = $(ele).find('.MarketBd').children();
    var leagueName = '';

    $(marketBdHtml).each((bdI, bdEle) => {
      var tagName = $(bdEle).prop('tagName');
      if (tagName == 'DIV') { // .MarketLea
        leagueName = $(bdEle).find('.SubHeadT').html();
      } else { // table
        var tableHtml = $(bdEle).find('tr');
        var matchList = [];
        $(tableHtml).each((tbI, tbEle) => {
          // console.log('--------------------');
          var aList = $(tbEle).find('td a');
          var findLink = $(tbEle).find('td.Icons a');
          var times = $(tbEle).find('td').find('.DateTimeTxt').find('span');
          var dateInfo = times[0];
          var timeInfo = times[1];
          var date = $(dateInfo).html();
          var time = $(timeInfo).html();
    
          var link = $(findLink).attr('href');
          // console.log(link);
          
          var smallObj = {};
    
          if (topHead == '1X2') {
            var leftObj = aList[0];
            var midObj = aList[1];
            var rightData = aList[2];
    
            var oddsLLeft = $(leftObj).find('.OddsL').html();
            var oddsRLeft = $(leftObj).find('.OddsR').html();
    
            var drawText = $(midObj).find('.OddsL').html();
            var drawScore = $(midObj).find('.OddsR').html();
    
            var oddsLRight = $(rightData).find('.OddsL').html();
            var oddsRight = $(rightData).find('.OddsR').html();
    
            smallObj = {
              time: date + '' + time,
              left: [oddsLLeft, oddsRLeft],
              mid: [drawText, drawScore],
              right: [oddsLRight, oddsRight],
              link: link
            };
          } else {
            var leftObj = aList[0];
            var rightData = aList[1];
    
            var oddsLLeft = $(leftObj).find('.OddsL').html();
            var oddsMLeft = $(leftObj).find('.OddsM').html();
            var oddsRLeft = $(leftObj).find('.OddsR').html();
    
            var oddsLRight = $(rightData).find('.OddsL').html();
            var oddsMRight = $(rightData).find('.OddsM').html();
            var oddsRight = $(rightData).find('.OddsR').html();
    
            smallObj = {
              time: date + '' + time,
              left: [
                oddsLLeft,
                oddsMLeft,
                oddsRLeft
              ],
              right: [
                oddsLRight,
                oddsMRight,
                oddsRight
              ],
              link: link
            };
          }

          // console.log(smallObj);
          matchList.push(smallObj);
        });

        var lObj = {
          league_name: leagueName,
          match_datas: matchList
        };

        dataList.push(lObj);
      }
    });

    var obj = {
      top_head: topHead,
      datas: dataList
    };

    // console.log(obj);
    setList.push(obj);
  });

  var structureString = JSON.stringify(setList);
  // console.log(structureString);

  const dirName = another.createName();
  const createdAt = another.createdAt();
  var sql = "INSERT INTO ffp_list (dir_name, content, created_at) VALUES ('" + dirName + "', '" + structureString + "', '" + createdAt + "');";

  connection.query(sql, async (err, result) => {
    if (err) {
      const createdAt = another.createdAt();
      another.nvsOpenAndAppendFile('log.html', createdAt + ' : Main INSERT ffp_list error DB : ' + err.message + '<br>\n');

      connection.end();
      process.exit();
    } else {
      // console.log(result);
      const hrefList = [];
      let href = '';
      var sql = '';
      let qStringInsert = '';

      $('.NonLiveMarket .Icons a').each((i, ele) => {
        href = ele.attribs.href;
        // console.log($(this).html(), href);
        if (hrefList.indexOf(href) == -1) {
          var realFileName = 'link-' + another.twoDigit(i) + '.html';
          hrefList.push(href);

          const code = dirName + '-' + realFileName; // 20200412-0021-link-7.html
          const numList = code.split('-');
          const lymd = numList[0]; // 20200412
          const hm = numList[1]; // 0021
          const ymd = lymd.substring(2, 8); // 200412
          const fData = numList[3]; // 7.html
          const f = fData.split('.')[0]; // 7

          const id = ymd + '' + hm + '' + f; // 20041200217
        //   console.log(id);

          sql = "('" + id + "', '" + code + "', '" + href + "', '" + dirName + "', '" + realFileName + "', '', '" + createdAt + "')";
          qStringInsert += (qStringInsert) ? ',' + sql : sql;
        }
      });

      var sqlInsert = "INSERT INTO ffp_detail (id, `code`, link, dir_name, file_name, content, created_at) VALUES ";
      sqlInsert += qStringInsert;
      sqlInsert += ';';

      if (qStringInsert != '') {
        // await another.nvsOpenAndAppendFile('log.html', createdAt + ' : Main Insert Detail info : ' + sqlInsert + '<br>\n');

        connection.query(sqlInsert, async (err, result) => {
          if (err) {
            const createdAt = another.createdAt();
            await another.nvsOpenAndAppendFile('log.html', createdAt + ' : Main Insert Detail error DB : ' + err.message + '<br>\n');

            connection.end();
            process.exit();
          } else {
            // console.log(result);
            connection.end();
            process.exit();
          }
        });
      } else {
        // console.log(result);
        connection.end();
        process.exit();
      }

    }
  });
}
// --- end write file --- //
