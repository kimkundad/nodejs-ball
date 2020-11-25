const http = require('http');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const EventEmitter = require('events');
const mysql = require('mysql');
var moment = require('moment-timezone');
var momentTz = require('moment-timezone');
var another = require('./need-functions.js');

var dbObject = require('./config.json');

class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter();
myEmitter.setMaxListeners(15);

const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e-6;
const time = process.hrtime();

var hostName = 'ballzaa.com';
var url = 'https://www.ballzaa.com/linkdooball.php';

var connection = mysql.createConnection({
  host: dbObject.database.host_name,
  database: dbObject.database.db_name,
  user: dbObject.database.db_username,
  password: dbObject.database.db_password
});

connection.connect(async function (err) {
  if (err) {
    const createdAt = another.createdAt();
    await another.nvsOpenAndAppendFile('log-ballzaa.html', createdAt + ' : Main error: DB : ' + err.message + '<br>\n');
    process.exit();
  } else {
    // ----- start check host ----- //
    var reqOne = http.request({ method: 'HEAD', timeout: 5000, host: hostName, port: 80, path: '/' }, async (r) => {
      const sttCode = JSON.stringify(r.statusCode);
      console.log(sttCode);
      sttCodeOne = parseInt(sttCode, 10);

      if (sttCodeOne > 0 && sttCodeOne < 400) {
        getContent();
      } else {
        connection.end();
        process.exit();
      }
    });
    reqOne.end();

    reqOne.on('timeout', () => {
      // reqOne.abort();

      connection.end();
      process.exit();
    });
    // ----- end check host ----- //
  }
});

// --- start get content --- //
function getContent() {
  puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] }).then(async browser => {
    const page = await browser.newPage();

    await page.setDefaultNavigationTimeout(0);

    // --- start log error --- //
    // var theTempValue;
    // page.on('error', async function (err) {
    //   theTempValue = err.toString();
    //   await another.nvsOpenAndAppendFile('log-ballzaa.html', 'Main error: ' + theTempValue + '<br>\n');
    // });
    // --- end log error --- //

    await page.goto(url);

    const html = await page.content();

    if (html) {
      console.log('Yes, has html');
      const $ = cheerio.load(html);

      noiHealer($);

      /*
      const diff = process.hrtime(time);
      // const nano = diff[0] * NS_PER_SEC + diff[1];
      const milli = (diff[0] * NS_PER_SEC + diff[1])  * MS_PER_NS;
      const totalTime = await another.nvsMillisToMinutesAndSeconds(milli);
      console.log(totalTime);
      */

      await browser.close();
    } else {
      console.log('No any html');
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
      const createdAt = another.createdAt();
      await another.nvsOpenAndAppendFile('log-ballzaa.html', createdAt + ' : matches puppeteer.launch error : ' + err.message + '<br>\n');

      connection.end();
      process.exit();
    });
}
// --- end get content --- //

// --- start save to db --- //
// async 
function noiHealer($) {
  const createdAt = another.createdAt();
  var insertStart = "INSERT INTO matches (match_name, match_time, home_team, away_team, created_at) VALUES";
  var insertItems = '';
  var matchList = [];

  var today = another.dateToday();
  var tomorrow = another.dateTomorrow();

  var timeStampNow = new Date().getTime();
  var date = new Date();
  var timeStampZeroToday = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
  var timeStampEightToday = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 0, 0, 0).getTime();

  if ((timeStampNow > timeStampZeroToday) && (timeStampNow <= timeStampEightToday)) {
    today = another.dateYesterday();
    tomorrow = another.dateToday();
  }

  var beginningTime = moment('08:00', 'hh:mm');
  // var beginningTime = moment('8:45', 'h:mm');
  var timeList = [800];
  var maxTime = 0;
  var endTime = '';
  var fullTime = '';
  var isBefore;
  var thisTime = 0;

  $('.linkball .link_rows').each((index, element) => {
    const matchTime = $(element).find('.l_time').text();
    const homeTeam = $(element).find('.l_team1').text();
    const awayTeam = $(element).find('.l_team2').text();
    const league = $(element).find('.l_program').text();

    endTime = moment(matchTime, 'hh:mm');
    isBefore = beginningTime.isBefore(endTime);

    if (timeList.length > 0) {
      maxTime = Math.max(timeList);
    }

    thisTime = parseInt(matchTime.replace(':', ''));
    // console.log(beginningTime.format('HH:mm'), endTime.format('HH:mm'), thisTime, isBefore);

    if (thisTime >= maxTime) {
      timeList.push(thisTime);
      fullTime = today + ' ' + matchTime + ':00';
    } else {
      fullTime = tomorrow + ' ' + matchTime + ':00';
    }

    if (matchList.length == 0) {
      insertItems += " ('" + league + "', '" + fullTime + "', '" + homeTeam + "', '" + awayTeam + "', '" + createdAt + "')";
    } else {
      insertItems += ", ('" + league + "', '" + fullTime + "', '" + homeTeam + "', '" + awayTeam + "', '" + createdAt + "')";
    }

    matchList.push({ match_time: fullTime, home_team: homeTeam, links: [] });
  });

  if (matchList.length > 0) {
    var link = '';
    var text = '';

    for (var i = 0; i < matchList.length; i++) {
      var links = [];
      var linkSet;

      $('.desc').each((idx, ele) => {
        if (idx == i) {
          linkSet = $(ele).find('.link_right');

          linkSet.each((i, e) => {
            link = $(e).find('a').attr('href');
            text = $(e).find('a').text();

            links.push({ href: link, text: text });
          });
        }
      });

      matchList[i].links = links;
    }

    var sqlTRUNCATE = "TRUNCATE TABLE matches;";
    // console.log(sqlTRUNCATE);
    connection.query(sqlTRUNCATE, async function (err, result) {
      if (err) {
        await another.nvsOpenAndAppendFile('log-ballzaa.html', 'DB: Delete matches error: ' + err.message + '<br>\n');
      }
    });

    var sqlMatch = insertStart + '' + insertItems + ';';
    connection.query(sqlMatch, async (err, result) => {
      if (err) {
        another.nvsOpenAndAppendFile('log-ballzaa.html', createdAt + ' DB: INSERT matches error: ' + err.message + '<br>\n');

        connection.end();
        process.exit();
      } else {
        // console.log(result);
        // OkPacket {
        //   fieldCount: 0,
        //   affectedRows: 27,
        //   insertId: 109,
        //   serverStatus: 2,
        //   warningCount: 0,
        //   message: "'Records: 27  Duplicates: 0  Warnings: 0",
        //   protocol41: true,
        //   changedRows: 0
        // }

        var sqlAllMatches = "SELECT id, match_time, home_team FROM matches";
        // console.log(sqlAllMatches);
        connection.query(sqlAllMatches, async (e, rs, fields) => {
          if (e) {
            const createdAt = another.createdAt();
            await another.nvsOpenAndAppendFile('log-ballzaa.html', createdAt + ' DB: SELECT matches error: ' + err.message + '<br>\n');
  
            connection.end();
            process.exit();
          } else {
            // console.log(rs);
            if (rs.length > 0) {
              var sqlLink = "INSERT INTO match_links (match_id, name, url) VALUES";
              var linkList = 0;

              for (var i = 0; i < rs.length; i++) {
                for (var j = 0; j < matchList.length; j++) {
                  var dbTime = momentTz(rs[i].match_time).format('YYYY-MM-DD HH:mm:ss');
                  if (matchList[j].match_time == dbTime && matchList[j].home_team == rs[i].home_team) {
                    // console.log(matchList[j].match_time, dbTime, matchList[j].home_team, rs[i].home_team);

                    // matchList[j].links => looping
                    // if (linkList.length == 0) {
                    //   sqlLink += " ('" + rs[i].id + "', '" + rs[i]. + "', '" + homeTeam + "', '" + awayTeam + "', '" + createdAt + "')";
                    // } else {
                    //   sqlLink += ", ('" + rs[i].id + "', '" + fullTime + "', '" + homeTeam + "', '" + awayTeam + "', '" + createdAt + "')";
                    // }

                    linkList++;
                  }
                }
              }
            }

            // check later
            connection.end();
            process.exit();
          }
        });
      }
    });
  } else {
    console.log('No any match.');

    connection.end();
    process.exit();
  }
}
// --- end save to db --- //