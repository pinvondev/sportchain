var express = require('express');
var sql = require('../dao/dao');
var router = express.Router();

/* GET shop page. */
router.get('/', function(req, res, next) {
    sql.queryAll("shops", [], function (error, results) {
        if (error) {
            throw error;
        } else {
            console.log(results.length);
            console.log(results[0].id);
            res.render('shop/', { shop: results[0] });
        }
    });
});

router.get('/activity', function(req, res, next) {
    res.render('shop/activity');
});

router.post('/activity', function(req, res, next) {
   console.log(req.body) ;
});

router.get('/rank', function(req, res, next) {
    res.render('shop/rank');
});

router.get('/signin', function(req, res, next) {
    res.render('shop/signin');
});

module.exports = router;
