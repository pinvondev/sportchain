var schedule = require('node-schedule');
var fs = require('fs');
var rule = new schedule.RecurrenceRule();
rule.minute = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
var sql = require('../dao/dao');

module.exports = {
    cronStyle: function () {
        schedule.scheduleJob(rule, function () {
            console.log(new Date());
            var params = [  // enterpriseShop暂时没有description字段, 以id字段代替
                'id, shopname, shoplogo, shoplink, introduction as description, energy',
                'personalShop',
                'id, enterpriseName as shopname, shopLogo as shoplogo, shoplink, id as description, energy',
                'enterpriseShop',
                'energy'
            ];
            sql.unionDescOrder(params)
                .then((results) => {
                    console.log(results);
                    // 将商家信息写入 json 文件
                    fs.writeFileSync('test.json', JSON.stringify(results));
                })
                .catch((error) => {
                    throw error;
                });
        });
    }
};