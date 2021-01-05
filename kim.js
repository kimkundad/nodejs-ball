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
    getContent();
});

function getContent() {
  
    puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] }).then(async browser => {
    
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
      
     console.log(html);
  
      if (html) {
        
        
        const $ = cheerio.load(html);
        
       // noiVinsmoke($);
  
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
  
        connection.end();
        process.exit();
      });
  }



