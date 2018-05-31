var express = require('express');
var enroll = require('../fabric/enrollAdmin');
var router = express.Router();

/* GET admin listing. */
router.get('/', function(req, res, next) {
    res.render('enrollAdmin', {title: 'Admin'});
});

router.get('/enroll', function(req, res, next) {
    enroll.enrollAdmin(function(isEnrolled, msg){
        if (isEnrolled) {
            console.log('pinvon', 'msg', msg);
            result = {
                code: 200,
                msg: msg
            }
            res.json(result);
        } else {
            result = {
                code: 400,
                msg: msg
            }
            res.json(result);
        }
    });
});

module.exports = router;