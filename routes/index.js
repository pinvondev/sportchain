var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.session);
  if (req.session.user) {
    res.render('index', { title: 'Express', username: req.session.user.name});
  } else {
    res.render('index', { title: 'Express', username: '请登录' });
  }
});

module.exports = router;
