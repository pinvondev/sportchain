var express = require('express');
var query = require('../fabric/query');
var userfabric = require('../fabric/user');
var fs = require('fs');
var stepfabric = require('../fabric/step');
var queryfabric = require('../fabric/query');
var qr_image = require('qr-image');
var path = require('path');
var sql = require('../dao/dao');
var router = express.Router();
var logger = require('../utils/logger');

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
    params = [
        req.body.name,    // username
        req.body.pass,    // password
        req.body.phone,    // phone
        req.body.email,    // email
        0                // isAdmin
    ]

    // 临时 将邮箱与电话改为可选
    params[2] = 'test';
    params[3] = 'test';

    console.log(params);
    // 增加用户名是否已注册的判断
    if (params[0] && params[1] && params[2] && params[3]) {
        sql.queryByName('users', params, function (error, result) {
            if (error) {
                throw error;
            } else {
                if (result.length === 0) {
                    sql.insert('users', params, function (error, result) {
                        if (error) {
                            throw error;
                        } else {
                            userfabric.registerUser(params[0], function (isRegister,msg) {
                                console.log('pinvon', msg, isRegister);
                                if (isRegister) {
                                    result = {
                                        code:200,
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
                        }
                    });
                } else {
                    back = {
                        code: 101,
                        msg: '该用户名已经被注册！'
                    }
                    return res.send(back);
                }
            }
        });
    } else {
        back = {
            code: 400,
            msg: '请填写完整的用户信息!'
        }
        return res.send(back);
    }
});

router.get('/login', function (req, res, next) {
    if (JSON.stringify(req.query) == "{}") {
		console.log(req.query);
		res.render('login');
	}
});

router.post('/login', function (req, res, next) {
    console.log('pinvon', '/login post');
    params = [
        req.body.name
    ]

    // 正式实现需要配置数据库, 存储密码, 然后才能判断用户输入的密码是否正确
    if (params && req.body.pass) {
        sql.queryByName('users', params, function (error, result) {
            if (error) {
                throw error;
            } else {
                if (result.length == 0 ){
                    back = {
                        code: 404,
                        msg: '用户名或密码错误！'
                    }
                    return res.send(back);
                    
                }else if (result[0].password != req.body.pass) {  // 密码错误
                    back = {
                        code: 400,
                        msg: '用户名或密码错误！'
                    }
                    return res.send(back);
                } else {
                    back = {
                        code: 200,
                        msg: '登录成功！'
                    }
                    req.session.user = {
                        'name': req.body.name,
                        'pass': req.body.pass
                    }
                    return res.send(back);
                }
            }
        });
    } else {
        back = {
            code: 400,
            msg: '请填写完整的用户信息!'
        }
        return res.send(back);
    }
});

router.get('/step', function (req, res, next) {
    res.render('step', { title: '步数' });
});

router.post('/step', function (req, res, next) {
    console.log('pinvon', 'post /step', req.session);
    var step = req.body.step;
    var sportEnergy = step;  // 公式要另外设置, 这边只是做简单除法
    console.log('pinvon', 'number of step', req.body.step);

    var args = [];
    var name = '';

    if (req.body.name === undefined) {
        args.push(req.session.user.name, step.toString(), sportEnergy.toString());
        name = req.session.user.name;
    } else if (req.body.name) {
        args.push(req.body.name, step.toString(), sportEnergy.toString());
        name = req.body.name;
    } else {
        args.push(req.session.user.tel, step.toString(), sportEnergy.toString());
        name = req.session.user.tel;
    }
    console.log('pinvon', name);
    var ccFun = 'setEnergy';
    stepfabric.step(name, ccFun, args, function (error, result) {
        if (error) {
            console.log('pinvon', error);
            userfabric.registerUser(req.session.user.name, function (isRegister, msg) {
                if (isRegister) {
                    back = {
                        code: 400,
                        msg: '网络异常, 请重新提交'
                    }
                    return res.json(back);
                }
            });
        } else {
            console.log('pinvon', result)
            if(result && result[1] && result[1].event_status === 'VALID') {
                back = {
                    code: 200,
                    msg: 'test'
                }
                if (req.session.user.tel) {
                    query_params = [
                        'personalShop',
                        'energy',
                        'phone=?',
                        req.session.user.tel
                    ]
                    sql.queryByConditions(query_params)
                        .then((query_result) => {
                            sportEnergy = query_result[0].energy + sportEnergy;
                            update_params = [
                                'personalShop',
                                'energy=' + sportEnergy.toString(),
                                'phone=?',
                                req.session.user.tel
                            ];
                            sql.updateByConditions(update_params)
                                .then((result) => {
                                    console.log('pinvon step queryByConditions', result);
                                })
                                .catch((error) => {
                                    console.log('pinvon step queryByConditions', error);
                                });
                        })
                }
                return res.json(back);
            }
        }
    });
});

router.get('/query', function(req, res, next){
    // query.queryByUser();
    res.render('query');
});

router.post('/query', function (req, res, next) {
    console.log('pinvon', 'post /query');
    console.log(req.body);
    
    var name = '';
    if (req.body.name) {  // 运动爱好者
        console.log('pinvon');
        name = req.body.name;
    } else {  // 商家
        name = req.session.user.tel;
    }
    
    var ccFun = 'querySportEnergy';
    var args = [name];
    console.log('pinvon', name, ccFun, args);
    queryfabric.queryByUsers(name, ccFun, args, function(error, fabric_response) {
        if (error) {
            console.log(error);
        } else {
            if (fabric_response === '') {
                back = {
                    code: 400,
                    msg: 'query is empty'
                }
                return res.json(back);
            }
            result = JSON.parse(fabric_response);
            back = {
                code: 200,
                msg: result
            }
            return res.json(back);
        }
    });
});

// 将活动信息返回给前端
//router.get('/activity', function (req, res, next) {
//  sql.queryActivityAndShops(function(error, result) {
//    if (error) {
//      throw error;
//    } else {
//      console.log(result);
//      res.send(result);
//    }
//  });
//});

router.get('/transaction', function (req, res, next) {
    res.render('transaction', { title: 'jiaoyi' });
});

router.post('/transaction', function (req, res, next) {
    console.log('wlf', 'post /transaction');
    console.log(req.body);
    var name1 = req.body.username;
    console.log('wlf', 'user1s name is', name1);
    var name2 = req.body.shopphone;
    console.log('wlf', 'user2s name is', name2);
    var X = req.body.energynum;
    console.log('wlf', 'number of transaction', X.toString());
    var args = [name1, name2, X.toString()];
    var ccFun = 'deal';
    
    stepfabric.step(name1, ccFun, args, function (error, result) {
        if (error) {
            console.log('pinvon', error);
            back = {
                code: 400,
                msg: '网络异常'
            }
            return res.json(back);
        } else {
            if (result && result[1] && result[1].event_status === 'VALID') {
                back = {
                    code: 200,
                    msg: 'success'
                }

                query_params = [
                    'personalShop',
                    'energy',
                    'phone=?',
                    name2
                ];
                sql.queryByConditions(query_params)
                    .then((query_result) => {
                        var sportEnergy = query_result[0].energy + X;
                        update_params = [
                            'personalShop',
                            'energy=' + sportEnergy.toString(),
                            'phone=?',
                            name2
                        ];
                        sql.updateByConditions(update_params)
                            .then((result) => {
                                console.log('pinvon step queryByConditions', result);
                            })
                            .catch((error) => {
                                console.log('pinvon step queryByConditions', error);
                            });
                    })
                return res.json(back);
            }
        }
    });
});

// 获取二维码
router.get('/qrcode', function (req, res, next) {
    // 二维码包含信息: 活动ID, 用户名, 是否为联合活动
    // 检查是否存在该活动
    params = ['activity', '*', 'shopName=?', [req.query.shop_name]];
    sql.queryByConditions(params).then((result) => {
    if (typeof result[0].user_id != 'object') {  // 检查用户是否已经兑换过
        params_user = ['users', 'id', 'username=?', [req.query.name]];
        sql.queryByConditions(params_user).then((result_user) => {
            var has_id = hasUserID(result[0].user_id, result_user[0].id);
            if (has_id) {
                back = {
                    code: 400,
                    msg: '您已兑换过该优惠券'
                }
                return res.json(back);
            } else {
                if (result[0].realCoupons >= result[0].totalCoupons) {
                    back = {
                        code: 401,
                        msg: '无剩余优惠券可兑换'
                    }
                    return res.json(back);
                } else {
                    // 更新数据库
                    update_params = [
                        'activity',
                        'realCoupons=?, user_id=?',
                        'id=?',
                        [result[0].realCoupons+1, result[0].user_id+'|'+result_user[0].id, result[0].id]
                    ];
                    sql.updateByConditions(update_params).then((update_result) => {
                        back = {
                            code: 200,
                            msg: result[0].url + ';' + result[0].id + ';' + req.session.user.name + ';'
                        }
                        return res.json(back);
                    }).catch((error) => {
                        throw error;
                    });
                }
            }
        }).catch((error) => {
            throw error;
        });
    } else {
        params_user = ['users', 'id', 'username=?', [req.query.name]];
        sql.queryByConditions(params_user).then((result_user) => {
            if (result[0].realCoupons >= result[0].totalCoupons) {
                back = {
                    code: 401,
                    msg: '无剩余优惠券可兑换'
                }
                return res.json(back);
            } else {
                console.log('pinvon', 'is null');
                // 更新数据库
                update_params = [
                    'activity', 
                    'realCoupons=?, user_id=?', 
                    'id=?', 
                    [result[0].realCoupons+1, result[0].user_id+'|'+result_user[0].id, result[0].id]
                ];
                sql.updateByConditions(update_params).then((update_result) => {
                    back = {
                        code: 200,
                        msg: result[0].id + ';' + req.session.user.name + ';'
                    }
                    return res.json(back);
                }).catch((error) => {
                    throw error;
                });
            }
        }).catch((error) => {
            throw error;
        });
    }
    }).catch((error) => {
        throw error;
    });
});

function hasUserID(str, user_id) {
    var users = str.split('|');
    console.log('pinvon', 'users', users, user_id);
    for (var index = 0; index < users.length; ++index) {
        if (user_id === parseInt(users[index])) {
            return true;
        }
    }
    return false;
}

// 用户进入商家界面
// /users/activity get
// params: shop_name
router.post('/activity', function (req, res, next) {
    console.log(req.body.shopid);
    console.log('activity', 'pinvon');
    // 返回商家名, 商家Logo, 商家描述, 商家能量
    var shop_params = [
        'personalShop',
        'shopname',
        'id=?',
        req.body.shopid
    ];
    sql.queryByConditions(shop_params)
        .then((shop_result) => {
            var params = [
                'activity',
                '*',
                'shopName=?',
                shop_result[0].shopname
            ];
            sql.queryByConditions(params)
                .then((results) => {
                    var data = {
                        code: 200,
                        data: results
                    }
                    console.log('pinvon result', data);
                    return res.json(data);
                })
                .catch((error) => {
                    throw error;
                });
        })
        .catch((error) => {
            throw error;
        });
});

router.get('/images', function (req, res, next) {
    params = ['users', '*', ''];
    sql.queryByConditions(params)
        .then(function (value) {
            console.log(value);
            res.json(value);
        })
        .catch(function (error) {
            throw error;
        });
});

//enter xuanchuan.html
router.get('/xuanchuan', function (req, res, next) {
    res.render('xuanchuan', { title: 'SportsChain' });
});

router.get('/logout', function (req, res, next) {
    res.clearCookie(req.session.name);
    req.session.destroy((err) => {
        console.log(err);
    });
    console.log('/logout success');
    res.redirect('/');
});

// 关注列表
router.get('/focus', function (req, res, next) {
    params = ['messages', 'messages_title, messages_info', ''];
    sql.queryByConditions(params)
        .then(function (value) {
            result = {
                msg: value
            }
            logger.info(result);
            res.json(result);
        })
        .catch(function (error) {
            throw error;
        });
});

// 推荐列表
router.get('/recommend', function (req, res, next) {
    // 获取用户关注的话题
    var params = [req.session.user.name];
    logger.info(params);
    sql.queryTopicByUsers(params)
        .then(function (value) {
            logger.info(value);
        })
        .catch(function (error) {
            throw error;
        });
    // 获取相关话题的帖子
});

// 发表帖子
router.post('/publish', function (req, res, next) {
    var param = ['messages', 'messages_title, messages_info, messages_time, messages_commentnum, messages_transpondnum, messages_agreenum, messages_response, user_id', '"标题", "内容", now(), 1, 1, 1, "评论", 1', ''];
    sql.insertByConditions(param)
        .then(function (value) {
            logger.info(value);
        })
        .catch(function (error) {
            throw error;
        });
});

module.exports = router;
