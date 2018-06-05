var express = require('express');
var sql = require('../dao/dao');
var utils = require('../util/util');
var router = express.Router();

/* GET shop page. */
router.get('/', function(req, res, next) {
    if (req.session === undefined || req.session.user === undefined) {
        console.log('pinvon', 'undefined');
        res.redirect('../shop/login');
    } else {
        sql.queryByName('shops', [req.session.user.name], function (error, results) {
            if (error) {
                throw error;
            } else {
                console.log(results);
                shopId = results.id;
                res.render('shop/', { shop: results });
            }
        });
    }
});

router.get('/login', function (req, res, next) {
    console.log('pinvon', 'login');
    res.render('shop/login');
});

router.get('/activity', function(req, res, next) {
    sql.queryByName('activity', [req.session.user.name], function (error, result) {
        if (error) {
            throw error;
        } else if (result.length === 0) {// 如果未设置活动
            console.log('pinvon', 'get activity', result);
            res.render('shop/activity');
        } else if (result[0].endTime < Date.parse(new Date())) {// 如果活动时间已过, 则从表中删除该活动记录
            console.log('pinvon', 'timeout');
            sql.deleteByName('activity', [req.session.user.name], function (error, result) {
                if (error) {
                    throw error;
                } else {
                    res.render('shop/activity');
                }
            });
        } else {
            // 如果已经设置过活动时间, 则显示活动细节
            beginTime = utils.timestampToDate(result[0].beginTime);
            result[0].beginTime = beginTime;

            endTime = utils.timestampToDate(result[0].endTime);
            result[0].endTime = endTime;
            console.log('pinvon', result[0]);
            res.render('shop/activity', {result: result[0]});
        }
    });
});

router.post('/activity', function(req, res, next) {
    console.log(req.body);
    params = [
        req.session.user.name,
        0,
        req.body.nBeginTime,
        req.body.nEndTime,
        req.body.nCoupons,
        0,
        req.body.fDiscount,
        req.body.sUrl,
        req.body.nEnergy
    ]

    console.log('pinvon', params);
    sql.insert('activity', params, function(error, result){
        if (error) {
            throw error;
        } else {
            console.log(result);
            response = {
                code: 200
            }
            res.json(response);
            return ;
        }
    });
});

router.get('/rank', function(req, res, next) {
    res.render('shop/rank');
});

router.get('/signin', function(req, res, next) {
    res.render('shop/signin');
});

router.get('/person', function(req, res, next) {
    res.render('shop/person');
});

module.exports = router;
