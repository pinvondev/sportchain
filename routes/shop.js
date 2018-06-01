var express = require('express');
var sql = require('../dao/dao');
var router = express.Router();

/* GET shop page. */
router.get('/', function(req, res, next) {
    sql.queryByName('shops', [req.session.user.name], function (error, results) {
        if (error) {
            throw error;
        } else {
            console.log(results);
            shopId = results.id;
            res.render('shop/', { shop: results });
        }
    });
});

router.get('/activity', function(req, res, next) {
    res.render('shop/activity');
});

router.post('/activity', function(req, res, next) {
    console.log(req.body);
    if (req.body.flag === 'submit') {
        params = [
            req.session.user.name,
            0,
            req.body.nBeginTime,
            req.body.nEndTime,
            req.body.nCoupons,
            req.body.nCoupons,
            req.body.fDiscount,
            req.body.sUrl
        ]
    }
    console.log('pinvon', params);
    sql.insert('activity', params, function(error, result){
        if (error) {
            throw error;
        } else {
            console.log(result);
        }
    });
});

router.get('/rank', function(req, res, next) {
    res.render('shop/rank');
});

router.get('/signin', function(req, res, next) {
    res.render('shop/signin');
});

module.exports = router;
