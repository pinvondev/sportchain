var utils = require('../dao/personalShop');
var sms = require('./sms');

sms.validateCode('13459238667', function(result){
    console.log('pinvon', result);
})

var tables = 'personalShop, enterpriseShop';
var columns = 'column1, column2, column3';
var filter = 'column1=?, column2=?, column3=?';
console.log(utils.queryByConditions(tables, columns, filter));