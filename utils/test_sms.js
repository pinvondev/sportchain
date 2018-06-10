var personalShop = require('../dao/personalShop');
var sms = require('./sms');
var schedule = require('./schedule');
var sql = require('../dao/dao');
var fs = require('fs');
var util = require('./util');

sms.validateCode('13459238667', function(result){
    console.log('pinvon', result);
})

var tables = 'personalShop, enterpriseShop';
var columns = 'column1, column2, column3';
var filter = 'column1=?, column2=?, column3=?';
console.log(personalShop.queryByConditions(tables, columns, filter));

util.getIP();