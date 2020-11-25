
var fs = require('fs');
const path = require('path');
var moment = require('moment');
var momentTz = require('moment-timezone');
var rimraf = require('rimraf');
const histDay = 24;

var nfc = module.exports = {
    nvsNeedFile: function () {
        const nfList = [{ 'type': 'file', 'name': 'index.html' },
        { 'type': 'file', 'name': 'noi.html' },
        { 'type': 'file', 'name': 'log.html' },
        { 'type': 'file', 'name': 'memory-usage.html' },
        { 'type': 'file', 'name': 'time-usage.html' },
        { 'type': 'file', 'name': 'config.json' }];

        if (nfList.length > 0) {
            for (let i = 0; i < nfList.length; i++) {
                var obj = nfList[i];
                var path = obj.name;

                try {
                    if (!fs.existsSync(path)) {
                        if (obj.type == 'dir') {
                            fs.mkdirSync(obj.name);
                        } else if (obj.type == 'file') {
                            fs.open(obj.name, 'w', function (err, file) {
                                if (err) {
                                    // throw err;
                                } else {
                                    // console.log('Saved!');
                                }
                            });
                        }
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        }
    },
    nvsDateTime: function () {
        const dt = new Date();
        return dt.toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
    },
    twoDigit: function (intNumber) {
        let retNumber = '' + intNumber;

        if (intNumber < 10) {
            retNumber = '0' + intNumber;
        }

        return retNumber;
    },
    dateYesterday: function () {
        var yest = moment().subtract(1, 'days');
        return moment(yest).format("YYYY-MM-DD");
    },
    dateToday: function () {
        const date = momentTz().tz("Asia/Bangkok").format('YYYY-MM-DD');
        return date;
    },
    dateTomorrow: function () {
        var tomorrow = moment().add(1, 'days');
        return moment(tomorrow).format("YYYY-MM-DD");
    },
    createdAt: function () {
        const dTime = momentTz().tz("Asia/Bangkok").format('YYYY-MM-DD HH:mm:ss');

        return dTime;
    },
    createTime: function () {
        const today = new Date();

        var seconds = today.getSeconds();
        var minutes = today.getMinutes();
        var hh = today.getHours();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();

        dd = nfc.twoDigit(dd);
        mm = nfc.twoDigit(mm);
        hh = nfc.twoDigit(hh);
        minutes = nfc.twoDigit(minutes);
        seconds = nfc.twoDigit(seconds);

        const dTime = yyyy + '-' + mm + '-' + dd + ' ' + hh + ':' + minutes + ':' + seconds;

        return dTime;
    },
    createName: function () {
        const dTime = momentTz().tz("Asia/Bangkok").format('YYYYMMDD-HHmm');

        return dTime;
    },
    nvsCreateDir: function () {
        var dirCreated = '';
        const dirName = momentTz().tz("Asia/Bangkok").format('YYYYMMDD-HHmm');
        const dir = 'links/' + dirName;

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            dirCreated = dir;
        }

        return dirCreated;
    },
    nvsOpenAndWriteFile: function (fileName, obOne) {
        return new Promise((resolve, reject) => {
            fs.open(fileName, 'w', (err, file) => {
                if (err) {
                    reject(err);
                } else {
                    // console.log('Open file: ' + nfc.nvsDateTime());
                    fs.writeFile(fileName, obOne, (error) => {
                        if (error) {
                            fs.close(file, () => {
                                // ...
                            });

                            reject(error);
                        } else {
                            // console.log('Write file: ' + nfc.nvsDateTime());
                            fs.close(file, () => {
                                // ...
                            });

                            resolve(true);
                        }
                    });
                }
            });
        });
    },
    nvsMillisToMinutesAndSeconds: function (millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        // return minutes + ":" + (seconds < 10 ? '0' : '') + seconds + ' minutes:seconds';
        let strTime = '';

        if (minutes > 0) {
            strTime += minutes + ' minute';
            strTime += (minutes > 1) ? 's' : '';
        }

        // if (seconds < 10) {
        //   strTime += '0';
        // }

        strTime += ' ' + seconds + ' seconds';
        // console.log(strTime);

        return strTime;
    },
    nvsClearAllLink: function () {
        const dir = 'links';
        fs.readdir(dir, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(dir, file), err => {
                    if (err) throw err;
                });
            }
        });
    },
    nvsFirstFile: () => {
        const dir = 'links';

        const directoryPath = path.join(__dirname, dir);
        return new Promise((resolve, reject) => {
            fs.readdir(directoryPath, (err, files) => {
                if (err) {
                    resolve([]);
                } else {
                    const arrDir = [];
                    if (files.length > 0) {
                        files.forEach(function (file) {
                            const filePath = directoryPath + '/' + file;
                            const isDir = fs.lstatSync(filePath).isDirectory();
                            if (isDir) {
                                arrDir.push(file);
                            }
                        });

                        if (arrDir.length > 0) {
                            arrDir.reverse();
                            // console.log(arrDir[0]);
                            const childDir = 'links/' + arrDir[0];
                            const childPath = path.join(__dirname, childDir);
                            fs.readdir(childPath, (error, childFiles) => {
                                const prop = fs.lstatSync(childPath + '/' + childFiles[0]);
                                const createdData = nfc.nvsCalculateAge(prop.birthtime);

                                resolve([childDir, childFiles[0], createdData['minutes']]);
                            });
                        } else {
                            resolve([]);
                        }
                    } else {
                        resolve([]);
                    }
                }
            });
        });
    },
    nvsPassedTime: (dateTime) => {
        const x = momentTz().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
        const nowTime = momentTz(x);
        const passedTime = momentTz(dateTime);

        // console.log('nowTime: ' + nowTime.format('YYYY-MM-DD HH:mm:ss'));
        // console.log('passedTime: ' + passedTime.format('YYYY-MM-DD HH:mm:ss'));

        const duration = momentTz.duration(nowTime.diff(passedTime));
        const minutes = duration.asMinutes();
        var diffMn = Math.floor(minutes);

        return diffMn;
    },
    nvsCalculateAge: (birthtime) => {
        var nw = momentTz();
        var duration = momentTz.duration(nw.diff(birthtime));
        var minutes = duration.asMinutes();
        var hours = duration.asHours();
        var intMinutes = Math.floor(minutes);
        var intHours = Math.floor(hours);
        // console.log(minutes, intMinutes);
        // console.log(hours, Math.floor(hours));
        // const dTime = momentTz(birthtime).tz("Asia/Bangkok").format('YYYYMMDD-HHmm');
        const respData = { 'hours': intHours, 'minutes': intMinutes };
        return respData;
    },
    nvsCheckStatus: () => {
        const dir = 'links';

        const directoryPath = path.join(__dirname, dir);
        return new Promise((resolve, reject) => {
            fs.readdir(directoryPath, (err, files) => {
                if (err) {
                    // reject(err);
                    resolve(1);
                } else {
                    const arrDir = [];

                    if (files.length > 0) {
                        files.forEach(function (file) {
                            const filePath = directoryPath + '/' + file;
                            const isDir = fs.lstatSync(filePath).isDirectory();
                            if (isDir) {
                                arrDir.push(file);
                            }
                        });

                        if (arrDir.length > 0) {
                            arrDir.reverse();
                            // console.log(arrDir[0]);
                            const currDir = arrDir[0];
                            const fileStatusName = 'links/' + currDir + '/link-status.txt';
                            const directoryPath = path.join(__dirname, fileStatusName);

                            try {
                                if (fs.existsSync(directoryPath)) {
                                    fs.readFile(directoryPath, 'utf8', function (err, contents) {
                                        if (err) {
                                            resolve(1);
                                        } else {
                                            let stt = 0;
                                            if (contents) {
                                                stt = parseInt(contents, 10);
                                            }
                                            console.log(fileStatusName + ' : ' + stt);
                                            if (stt == 0) {
                                                resolve(0);
                                            } else {
                                                resolve(1);
                                            }
                                        }
                                    });
                                } else {
                                    resolve(1);
                                }
                            } catch (err) {
                                console.error(err);
                                resolve(1);
                            }
                        } else {
                            resolve(1);
                        }
                    } else {
                        resolve(1);
                    }
                }
            });
        });
    },
    currentDirectory: () => {
        const dir = 'links';

        const directoryPath = path.join(__dirname, dir);
        return new Promise((resolve, reject) => {
            fs.readdir(directoryPath, (err, files) => {
                if (err) {
                    // reject(err);
                    resolve('');
                } else {
                    const arrDir = [];

                    if (files.length > 0) {
                        files.forEach(function (file) {
                            const filePath = directoryPath + '/' + file;
                            const isDir = fs.lstatSync(filePath).isDirectory();
                            if (isDir) {
                                arrDir.push(file);
                            }
                        });

                        if (arrDir.length > 0) {
                            arrDir.reverse();
                            const currDir = arrDir[0];
                            resolve(currDir);
                        } else {
                            resolve('');
                        }
                    } else {
                        resolve('');
                    }
                }
            });
        });
    },
    nvsLastCheckLeft: () => {
        const dir = 'links';
        const directoryPath = path.join(__dirname, dir);

        return new Promise((resolve, reject) => {
            fs.readdir(directoryPath, (err, files) => {
                if (err) {
                    // reject(err);
                    resolve(1);
                } else {
                    const arrDir = [];

                    if (files.length > 0) {
                        files.forEach(function (file) {
                            const filePath = directoryPath + '/' + file;
                            const isDir = fs.lstatSync(filePath).isDirectory();
                            // console.log(a);
                            if (isDir) {
                                arrDir.push(file);
                            }
                        });

                        if (arrDir.length > 0) {
                            arrDir.reverse();
                            // console.log(arrDir[0]);

                            const dir = 'links/' + arrDir[0];
                            // const dir = 'links/' + arrDir[0] + '/link-left.json';
                            const lastPath = path.join(__dirname, dir);

                            try {
                                if (fs.existsSync(lastPath)) {
                                    fs.readdir(lastPath, function (err, files) {
                                        if (err) {
                                            console.log(err);
                                            resolve([]);
                                        } else {
                                            if (files.length > 0) {
                                                const fileNull = [];
                                                files.forEach((file, idx) => {
                                                    if (file != 'link-status.txt' && file != 'link-detail.json') {
                                                        const filePath = lastPath + '/' + file;
                                                        const stats = fs.lstatSync(filePath);
                                                        const fileSizeInBytes = stats["size"];

                                                        if (fileSizeInBytes <= 1) {
                                                            // console.log(filePath, fileSizeInBytes);
                                                            fileNull.push(file);
                                                            // fs.unlink(filePath, err => {
                                                            //     if (err) throw err;
                                                            //     fileNull.push(file);
                                                            // });
                                                        }
                                                    }
                                                });
                                                resolve([fileNull, lastPath]);
                                            } else {
                                                resolve([]);
                                            }
                                        }
                                    });
                                } else {
                                    resolve([]);
                                }
                            } catch (err) {
                                console.error(err);
                                resolve([]);
                            }
                        } else {
                            resolve([]);
                        }
                    } else {
                        resolve([]);
                    }
                }
            });
        });
    },
    nvsOpenAndWriteLinkFile: function (fileName, link) {
        return new Promise((resolve, reject) => {
            fs.open(fileName, 'w', (err, file) => {
                if (err) {
                    reject(err);
                } else {
                    fs.writeFile(fileName, link, (error) => {
                        if (error) {
                            fs.close(file, () => { });
                            reject(error);
                        } else {
                            fs.close(file, () => { });
                            resolve(true);
                        }
                    });
                }
            });
        });
    },
    nvsReadFile: function (fileName) {
        return new Promise((resolve) => {
            fs.readFile(fileName, 'utf8', function (err, contents) {
                if (err) {
                    // reject({ status: false, data: err.message });
                    resolve({ status: false, data: err.message });
                } else {
                    // console.log(contents);
                    resolve({ status: true, data: contents });
                }
            });
        });
    },
    nvsOpenAndAppendFile: function (fileName, obOne) {
        return new Promise((resolve, reject) => {
            const time = nfc.createTime();
            const message = time + ': ' + obOne;
            fs.appendFile(fileName, message, 'utf8', (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    },
    nvsCheckOs: function getOS() {
        return process.platform;
    },
    nvsListLinkDir: (compareFile) => {
        const dir = 'links';
        const directoryPath = path.join(__dirname, dir);
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                console.log(err.message);
            } else {
                if (files.length > 0) {
                    files.forEach(function (file) {
                        const filePath = directoryPath + '/' + file;
                        console.log(file, compareFile);
                        if (file != compareFile) {
                            // compareFile
                        }
                    });
                }
            }
        });
    },
    nvsListLinkDirForDelete: () => {
        const dir = 'links';
        const directoryPath = path.join(__dirname, dir);
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                console.log(err.message);
            } else {
                if (files.length > 0) {
                    var setRm = 0;
                    files.forEach(function (file) {
                        if (setRm < 5) {
                            const filePath = directoryPath + '/' + file;
                            const stats = fs.lstatSync(filePath);
                            const createdData = nfc.nvsCalculateAge(stats['birthtime']);
                            if (createdData.hours > histDay) {
                                rimraf(filePath, function () { console.log('done'); });
                            }
                            setRm++;
                        }
                    });
                }
            }
        });
    }
    /*,
    nvsList_F_F_P_FilesForDelete: () => {
        const dir = 'f-f-p';
        const directoryPath = path.join(__dirname, dir);
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                console.log(err);
            } else {
                if (files.length > 0) {
                    var setRm = 0;
                    files.forEach(function (file) {
                        if (setRm < 5) {
                            const filePath = directoryPath + '/' + file;
                            const stats = fs.lstatSync(filePath);
                            const createdData = nfc.nvsCalculateAge(stats['birthtime']);
                            if (createdData.hours > histDay) {
                                rimraf(filePath, function () { console.log('done'); });
                            }
                            setRm++;
                        }
                    });
                }
            }
        });
    }*/
};