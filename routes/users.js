var express = require('express');
var query = require('../fabric/query');
var userfabric = require('../fabric/user');
var fs = require('fs');
var stepfabric = require('../fabric/step');
var queryfabric = require('../fabric/query');
var sql = require('../dao/dao');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  console.log('get register');	
	if (JSON.stringify(req.query) == "{}") {
		console.log(req.query);
		res.render('register');
	}
});

router.post('/register', function(req, res, next) {
  console.log('pinvon', '/register post');
  var name = req.body.uname;
  var pass = req.body.upwd;
  fs.writeFile('pass.txt', pass, function(err) {
    if (err) {
      return console.error(err);
    }
  });
  userfabric.registerUser(name, function(isRegister, msg) {
    if (isRegister) {
      req.session.user = {
        'name': name,
        'pass': pass
      }
      console.log(req.session);
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

router.get('/login', function (req, res, next) {
  if (JSON.stringify(req.query) == "{}") {
		console.log(req.query);
		res.render('login');
	}
});

router.post('/login', function (req, res, next) {
  console.log('pinvon', '/login post');
  var name = req.body.uname;
  var pass = req.body.upwd;

  // 正式实现需要配置数据库, 存储密码, 然后才能判断用户输入的密码是否正确
  fs.readFile('pass.txt', function (err, data) {
    if (err) {
      return console.error(err);
    }
    console.log(data.toString());
    console.log(typeof pass);
    if (data.toString().indexOf(pass) > -1) {
      req.session.user = {
        'name': name,
        'pass': pass
      }
      console.log(req.session);
      result = {
        code: 200
      }
      res.json(result);
    }
  });
});

router.get('/step', function (req, res, next) {
  res.render('step', { title: '步数' });
});

router.post('/step', function (req, res, next) {
  console.log('pinvon', 'post /step', req.session);
  
  var step = req.body.step;
  var sportEnergy = step / 100;  // 公式要另外设置, 这边只是做简单除法
  console.log('pinvon', 'number of step', req.body.step);
  
  var args = [step.toString(), req.session.user.name, sportEnergy.toString()];
  var ccFun = 'createSportEnergy';

  stepfabric.step(req.session.user.name, ccFun, args);
});

router.get('/query', function(req, res, next){
  // query.queryByUser();
  res.render('query');
});

router.post('/query', function (req, res, next) {
  console.log('pinvon', 'post /query');
  console.log(req.session);
  var name = req.session.user.name;
  var ccFun = 'querySportEnergy';
  var args = [name];
  console.log('pinvon', name, ccFun, args);
  queryfabric.queryByUsers(name, ccFun, args);
});

// 将活动信息返回给前端
router.get('/activity', function (req, res, next) {
  sql.queryActivityAndShops(function(error, result) {
    if (error) {
      throw error;
    } else {
      console.log(result);
      res.send(result);
    }
  });
})

module.exports = router;
