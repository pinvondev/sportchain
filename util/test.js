var sms = require('./sms');

sms.validateCode('13459238667', function(result){
    console.log('pinvon', result);
})