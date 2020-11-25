var another = require('./need-functions.js');
var mysql = require('mysql');
var dbObject = require('./config.json');
// console.log(dbObject);

var connection = mysql.createConnection({
    host: dbObject.database.host_name,
    database: dbObject.database.db_name,
    user: dbObject.database.db_username,
    password: dbObject.database.db_password
});

// console.log(connection);

connection.connect(function (err) {
    // if (err) throw err;
    if (err) {
        console.log(err.message);
        // code: 'ER_ACCESS_DENIED_ERROR',
        // errno: 1045,
        // message: "Access denied for user 'root1'@'localhost' (using password: YES)",
        // sqlState: '28000',
        // fatal: true
        process.exit();
    } else {
        /*
        var checkDBQuery = "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'dbname'";
        connection.query(checkDBQuery, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
        });
        // connection.query("CREATE DATABASE mydb", function (err, result) {
        //     if (err) throw err;
        //     console.log("Database created");
        // });
        */

        saveToDB();
    }
});

async function saveToDB() {
    const filePath = 'list/last-insert-db.txt';
    const datas = await another.nvsReadFile(filePath);
    if (datas.status) {
        console.log(datas.data);
    } else {
        console.log(datas.data);
        const dt = datas.data;
        if (dt) {
            // check with compare file
            const datas = await another.nvsListLinkDir(dt);
        } else {
            // loop from get first in links dir
            const datas = await another.nvsListLinkDir('');
        }
    }
}

/*
connection.query('SELECT * FROM employee', function (error, results, fields) {
    if (error)
        throw error;

    results.forEach(result => {
        console.log(result);
    });
});
*/

connection.end();
// process.exit();