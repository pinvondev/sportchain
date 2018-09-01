var express = require('express');
var queryfabric = require('../fabric/query');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.session);
  if (req.session === undefined) {
    res.render('index', { title: '首页', username: '请登录'});
  } else if (req.session.user) {
    res.render('index', { title: 'Express', username: req.session.user.name});
  } else {
    res.render('index', { title: 'Express', username: '请登录' });
  }
});

router.get('/msp', function (req, res, next) {
    queryfabric.queryByUsers('admin', '');
});

// 获取历史信息
router.get('/history', function (req, res, next) {
    queryfabric.queryByUsers('admin', 'getHistory', [req.query.name], function (error, result) {
    if (error) {
      return res.render('history');
    } else {
      result = JSON.parse(result);
      if (result.length === 0) {
        return res.render('history');
      }
      backs = []
      for (let index = 0; index < result.length; ++index) {
        back = {
          txid: result[index].txId,
          step: result[index].value.step,
          energy: result[index].value.energy,
          timestamp: result[index].value.timestamp
        }
        backs.push(back);
      }
      return res.render('history', {historys:backs});
    }
  })
});

router.get('/block', function (req, res, next) {
  queryfabric.queryByBlockId(req.query.num, function(error, result) {
    if (error) {
      return res.json(error);
    } else {
      console.log('pinvon', result);
      return res.json(result);
    }
  })
});

router.get('/test', function (req, res, next) {
    return res.render('test');
});

module.exports = router;
