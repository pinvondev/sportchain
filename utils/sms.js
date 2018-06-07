var qs = require("querystring");
var request = require("request");
var sha1 = require("sha1");

module.exports = {
    validateCode: function (tel, done) {
        var str = "along";
        var Appkey = "7da038f591a7f49fc0606ee6dac7cd66";
        // var AppKey = "7da038f591a7f49fc0606ee6dac7cd67";
        var Appsecret = "d4b911362131";
        var Nonce = "yuanji";
        var time = new Date();
        var CurTime = time.getTime();
        var CheckSum = sha1(Appsecret + Nonce + CurTime);
        var account;
        // console.log(CheckSum);
        var post_data = {
            mobile: tel
        };
        //这是需要提交的数据
        var content = qs.stringify(post_data);
        var proxy_url = 'https://api.netease.im/sms/sendcode.action?' + content;
        var options = {
            url: proxy_url,
            method: 'POST',
            headers: {
                'AppKey': Appkey,
                'Nonce' : Nonce,
                'CurTime': CurTime,
                'CheckSum': CheckSum,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        };
        function callback(error, response, body) {
            account = JSON.parse(body)
            console.log(account);
            console.log(account.obj);
            return done(account);
        }
        request(options, callback);
    }
}