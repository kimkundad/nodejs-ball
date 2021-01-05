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
    getContent2();
});

function getContent2() {
 // console.log('Yes, has html');
  let scrape = async () => {

    const browser = await puppeteer.launch({args: ['--no-sandbox']});
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.content();
    await browser.close();
    console.log(html);
    if (html) {
      
      const $ = cheerio.load(html);
      
     // noiVinsmoke($);
      console.log('Yes, has html');
    
    //  await browser.close();
    } else {

      await browser.close();
    }
    return html;
    
    }
    scrape().then((value) => {
      console.log(value); // Success!
  });
  
}



