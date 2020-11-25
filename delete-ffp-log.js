const EventEmitter = require('events');
const mysql = require('mysql');
var dbObject = require('./config.json');

class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter();
myEmitter.setMaxListeners(15);

var another = require('./need-functions.js');

var connection = mysql.createConnection({
  host: dbObject.database.host_name,
  database: dbObject.database.db_name,
  user: dbObject.database.db_username,
  password: dbObject.database.db_password
});

connection.connect(async function (err) {
  if (err) {
    await another.nvsOpenAndAppendFile('log.html', 'Delete error: DB : ' + err.message + '<br>\n');
  }
});

another.nvsListLinkDirForDelete();
// another.nvsList_F_F_P_FilesForDelete();

// --- start get date --- //
/*
var today = new Date();
today.setDate(today.getDate() - 1); // yesterday

var dd = today.getDate();
var mm = today.getMonth() + 1;
var yyyy = today.getFullYear();

dd = another.twoDigit(dd);
mm = another.twoDigit(mm);
*/
// --- end get date --- //

var sqlList = "DELETE FROM ffp_list WHERE created_at < DATE_SUB(NOW(), INTERVAL 48 HOUR);";
connection.query(sqlList, async function (err, result) {
  if (err) {
    await another.nvsOpenAndAppendFile('log.html', 'Delete dir error: DB : ' + err.message + '<br>\n');
  }
});

var sqlDetail = "DELETE FROM ffp_detail WHERE created_at < DATE_SUB(NOW(), INTERVAL 48 HOUR);";
connection.query(sqlDetail, async function (err, result) {
  if (err) {
    await another.nvsOpenAndAppendFile('log.html', 'Delete detail error: DB : ' + err.message + '<br>\n');
  }
});

/*
var sqlDetail = "DELETE FROM ffp_file WHERE created_at < DATE_SUB(NOW(), INTERVAL 48 HOUR);";
connection.query(sqlDetail, async function (err, result) {
  if (err) {
    await another.nvsOpenAndAppendFile('log.html', 'Delete file detail error: DB : ' + err.message + '<br>\n');
  }
});*/

connection.end();
// process.exit();