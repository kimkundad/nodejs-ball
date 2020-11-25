/*
let moment = require('moment');

let x = moment();
let y = moment('2020-04-14 01:20:00');
let duration = moment.duration(x.diff(y));

let seconds = duration.as('seconds');
let minutes = duration.as('minutes');
// console.log(duration.as('minutes'));
// console.log(duration.as('hours'));

let diffSc = Math.floor(seconds);
let diffMn = Math.floor(minutes);
console.log(diffSc, diffMn);
*/
// --- || --- //
moment = require('moment-timezone');

x = moment();
console.log(x.tz("Asia/Bangkok").format('YYYY-MM-DD HH:mm:ss'));
y = moment('2020-04-14 01:21:00');
console.log(y.tz("Asia/Bangkok").format('YYYY-MM-DD HH:mm:ss'));

duration = moment.duration(x.diff(y));

seconds = duration.as('seconds');
minutes = duration.asMinutes();

diffSc = Math.floor(seconds);
diffMn = Math.floor(minutes);
console.log(diffSc, diffMn);