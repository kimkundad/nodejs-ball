const http = require('http');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const EventEmitter = require('events');
const mysql = require('mysql');
const linkDetailPerTime = 10;

require('events').EventEmitter.defaultMaxListeners = linkDetailPerTime;

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.setMaxListeners(linkDetailPerTime);

const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e-6
const time = process.hrtime();

var dbObject = require('./config.json');
var another = require('./need-functions.js');

var hostName = 'beer789.com';
var currentDir = '';
var dirListCreated = '';

var connection = mysql.createConnection({
    host: dbObject.database.host_name,
    database: dbObject.database.db_name,
    user: dbObject.database.db_username,
    password: dbObject.database.db_password
});

connection.connect(async function(err) {
    if (err) {
        const createdAt = another.createdAt();
        await another.nvsOpenAndAppendFile('log.html', createdAt + ': Detail error cannot connect DB: ' + err.message + '<br>\n');
        process.exit();
    } else {
        // ----- start check host ----- //
        var reqOne = http.request({ method: 'HEAD', timeout: 5000, host: hostName, port: 80, path: '/' }, async(r) => {
            // console.log(JSON.stringify(r.statusCode));
            const obOne = JSON.stringify(r.statusCode);
            sttCodeOne = parseInt(obOne, 10);

            if (sttCodeOne > 0 && sttCodeOne < 400) {
                updateDetailContent();
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

async function updateDetailContent() {
    // find latest dir that status is 0
    var sqlFDName = "SELECT dir_name, created_at FROM ffp_list WHERE scraping_status='0' ORDER BY dir_name DESC LIMIT 1";
    connection.query(sqlFDName, async(err, result, fields) => {
        if (err) {
            const createdAt = another.createdAt();
            await another.nvsOpenAndAppendFile('log.html', createdAt + ' : Detail SELECT dir_name error: DB : ' + err.message + '<br>\n');

            connection.end();
            process.exit();
        } else {
            // console.log(result);
            if (result.length > 0) {
                currentDir = result[0].dir_name;
                dirListCreated = result[0].created_at;

                // find content null in latest dir list
                var sqlFNC = "SELECT `code`, link FROM ffp_detail WHERE dir_name = '" + currentDir + "' AND (content IS NULL OR content='') ORDER BY `code` DESC LIMIT 1";
                // console.log(sqlFNC);
                connection.query(sqlFNC, async(err, resultContent, fields) => {
                    if (err) {
                        const createdAt = another.createdAt();
                        await another.nvsOpenAndAppendFile('log.html', createdAt + ' : Detail find null content error: DB : ' + err.message + '<br>\n');

                        connection.end();
                        process.exit();
                    } else {
                        // console.log('Has row to fill content in ' + currentDir + ': ' + resultContent.length);
                        if (resultContent.length > 0) {
                            const passedTimeMinute = another.nvsPassedTime(dirListCreated);
                            // console.log('Passed Time Minute: ' + passedTimeMinute);
                            if (passedTimeMinute < 121) {
                                const row = resultContent[0];
                                getContentLink(row.code, row.link);
                            } else {
                                // set ffp_list stt to 1
                                var sqlUpdateList = "UPDATE ffp_list SET scraping_status = '1' WHERE dir_name = '" + currentDir + "'";
                                // console.log('Detail: ' + sqlUpdateList);

                                connection.query(sqlUpdateList, async(err, result) => {
                                    if (err) {
                                        const createdAt = another.createdAt();
                                        await another.nvsOpenAndAppendFile('log.html', createdAt + ' : Detail Update dir_name error DB : ' + err.message + '<br>\n');

                                        connection.end();
                                        process.exit();
                                    } else {
                                        console.log(result.affectedRows + " record(s) updated.");

                                        connection.end();
                                        process.exit();
                                    }
                                });
                            }
                        } else {
                            // set ffp_list stt to 1
                            var sqlUpdateList = "UPDATE ffp_list SET scraping_status = '1' WHERE dir_name = '" + currentDir + "'";
                            // console.log('Detail: ' + sqlUpdateList);

                            connection.query(sqlUpdateList, async(err, result) => {
                                if (err) {
                                    const createdAt = another.createdAt();
                                    await another.nvsOpenAndAppendFile('log.html', createdAt + ' : Detail Update dir_name error DB : ' + err.message + '<br>\n');

                                    connection.end();
                                    process.exit();
                                } else {
                                    console.log(result.affectedRows + " record(s) updated.");

                                    connection.end();
                                    process.exit();
                                }
                            });
                        }
                    }
                });
            } else {
                connection.end();
                process.exit();
            }
        }
    });
}

// --- start get link content --- //
async function getContentLink(code, link) {
    const url = 'http://www.beer789.com' + link;
    console.log(url); // remove later

    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'load', timeout: 0 });
        const html = await page.content();
        // console.log('html length: ' + (html.length));

        await browser.close();

        console.log('html: ' + html.length);
        if (html && (html != null) && (html != 'null')) {

            const $ = cheerio.load(html);

            var l = '';
            let vs = '';
            let eventTime = '';

            var aLength = $('#panel-breadcrumb .Trail a').length;
            $('#panel-breadcrumb .Trail a span').each((idx, ele) => {
                if (idx == (aLength - 1)) {
                    l = $(ele).html();
                }
            });

            $('#panel-breadcrumb .Trail span').remove();
            vs = $('#panel-breadcrumb .Trail').html();
            eventTime = $('.EventTime').html();

            // console.log('l: ' + l, 'vs: ' + vs, 'ev time: ' + eventTime);
            // const createdAt = another.createdAt();
            // await another.nvsOpenAndAppendFile('log.html', createdAt + ' : Detail top info : ' + l + ', ' + vs + ', ' + eventTime + '<br>\n');

            const nonLiveMarket = $('.NonLiveMarket').html();

            if (nonLiveMarket && (nonLiveMarket != null) && (nonLiveMarket != 'null')) {
                // console.log('nonLiveMarket: ' + nonLiveMarket.length);
                // await another.nvsOpenAndWriteFile(fileName, nonLiveMarket);

                // --------------- start json string ------------ //
                var structure = [];

                $('.NonLiveMarket .MarketT').each((i, ele) => {
                    // console.log(i, $(ele).html());
                    // console.log($(ele).find('.MarketHd .SubHead span').html());
                    var topHead = $(ele).find('.MarketHd .SubHead span').html();

                    if (topHead == 'Over Under' || topHead == '1X2' || topHead == 'Asian Handicap') {
                        // var bd = $(ele).find('.MarketBd').html();
                        // console.log(topHead);
                        // var a = $(ele).find('.MarketBd').find('tr a');

                        var dataList = [];
                        var tr = $(ele).find('.MarketBd').find('tr');

                        $(tr).each((trI, trEle) => {
                            // var trContent = $(trEle).html();
                            // console.log('--------------------');
                            var aList = $(trEle).find('td a');
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

                                var smallObj = {
                                    left: [oddsLLeft, oddsRLeft],
                                    mid: [drawText, drawScore],
                                    right: [oddsLRight, oddsRight]
                                };

                                // console.log(smallObj);
                                dataList.push(smallObj);
                            } else {
                                var leftObj = aList[0];
                                var rightData = aList[1];

                                var oddsLLeft = $(leftObj).find('.OddsL').html();
                                var oddsMLeft = $(leftObj).find('.OddsM').html();
                                var oddsRLeft = $(leftObj).find('.OddsR').html();

                                var oddsLRight = $(rightData).find('.OddsL').html();
                                var oddsMRight = $(rightData).find('.OddsM').html();
                                var oddsRight = $(rightData).find('.OddsR').html();

                                var smallObj = {
                                    left: [oddsLLeft, oddsMLeft, oddsRLeft],
                                    right: [oddsLRight, oddsMRight, oddsRight]
                                };

                                // console.log(smallObj);
                                dataList.push(smallObj);
                            }

                            // $(aList).each((aI, aEle) => {
                            //     console.log($(aEle).html());
                            // });
                            // console.log('--------------------');
                        });

                        var obj = {
                            top_head: topHead,
                            datas: dataList
                        };

                        // console.log(obj);
                        structure.push(obj);
                    }
                });

                var structureString = JSON.stringify(structure);
                // console.log(structureString);
                // --------------- end json string ------------ //

                var sqlUpdate = "UPDATE ffp_detail SET content = '" + structureString + "'";
                sqlUpdate += ", league_name='" + l + "'";
                sqlUpdate += ", vs='" + vs + "'";
                sqlUpdate += ", event_time='" + eventTime + "' ";
                sqlUpdate += "WHERE `code` = '" + code + "'";

                connection.query(sqlUpdate, async(err, result) => {
                    if (err) {
                        const createdAt = another.createdAt();
                        await another.nvsOpenAndAppendFile('log.html', createdAt + ' : Detail Update content error DB : ' + err.message + '<br>\n');

                        connection.end();
                        process.exit();
                    } else {
                        // console.log(result.affectedRows + " record(s) updated.");
                        connection.end();
                        process.exit();
                    }
                });
            } else {
                console.log('-- no nonLiveMarket --');
                // connection.end();
                // process.exit();

                var sqlUpdate = "UPDATE ffp_detail SET content = '-- no content --'";
                sqlUpdate += ", league_name='-- no league --'";
                sqlUpdate += ", vs='-- no vs --'";
                sqlUpdate += ", event_time='-- no time --' ";
                sqlUpdate += "WHERE `code` = '" + code + "'";

                connection.query(sqlUpdate, async(err, result) => {
                    if (err) {
                        const createdAt = another.createdAt();
                        await another.nvsOpenAndAppendFile('log.html', createdAt + ' : Detail Update content error DB : ' + err.message + '<br>\n');

                        connection.end();
                        process.exit();
                    } else {
                        // console.log(result.affectedRows + " record(s) updated.");
                        connection.end();
                        process.exit();
                    }
                });
            }
        }
    } catch (err) {
        // throwError(err, page, browser, res);
        const createdAt = another.createdAt();
        console.log('catch: ' + createdAt);
        await another.nvsOpenAndAppendFile('log.html', createdAt + ' : Detail puppeteer.launch error : ' + err.message + '<br>\n');

        // // --- can uncomment --- //
        // const used = process.memoryUsage().heapUsed / 1024 / 1024;
        // const msg = 'The script uses approximately: ' + (Math.round(used * 100) / 100) + ' MB';
        // await another.nvsOpenAndAppendFile('memory-usage.html', 'Detail used time: ' + msg + '<br>\n');

        // const diff = process.hrtime(time);
        // // const nano = diff[0] * NS_PER_SEC + diff[1];
        // const milli = (diff[0] * NS_PER_SEC + diff[1])  * MS_PER_NS;
        // const totalTime = another.nvsMillisToMinutesAndSeconds(milli);
        // await another.nvsOpenAndAppendFile('time-usage.html', 'Detail total time: ' + totalTime + '<br>\n');

        /*
        if (passedTimeMinute > 20) {
            // ...
            connection.end();
            process.exit();
        } else {*/
        connection.end();
        process.exit();
        // }
    }
}
// --- end get link content --- //