var express = require('express');
var sql = require('../dao/dao');
var utils = require('../utils/util');
var multer = require('multer');
var router = express.Router();

// var uploadFolder = 'public/upload/';
// utils.createFolder(uploadFolder);// 通过 storage 选项来对 上传行为 进行定制化

// 通过 filename 属性定制
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        uploadFolder = 'public/upload/'+req.session.user.tel;
        utils.createFolder(uploadFolder);
        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
    },
    filename: function (req, file, cb) {
        cb(null, req.session.user.tel);  
    }
});

// 通过 storage 选项来对 上传行为 进行定制化
var upload = multer({ storage: storage });

/* GET shop page. */
router.get('/', function(req, res, next) {
    if (req.session === undefined || req.session.user === undefined) {  // 未登录
        console.log('pinvon', 'undefined');
        return res.redirect('../shop/login');
    }

    if (req.session.user.shopName === undefined) {  // 如果商家信息未完善
        return res.redirect('../shop/person');
    } else {
        params = ['personalShop', '*', 'phone=?', [req.session.user.tel]];
        sql.queryByConditions(params, function (error, result) {
            if (error) {
                throw error;
            } else {
                console.log(result);
                res.render('shop/', { shop: result[0] });
            }
        });
        // sql.queryByName('shops', [req.session.user.name], function (error, results) {
        //     if (error) {
        //         throw error;
        //     } else {
        //         console.log(results);
        //         shopId = results.id;
        //         res.render('shop/', { shop: results });
        //     }
        // });
    }
});

router.get('/login', function (req, res, next) {
    if (JSON.stringify(req.query) == "{}") {
		console.log(req.query);
		res.render('shop/login');
	} 
});

router.post('/login', function (req, res, next) {
    console.log('pinvon', 'post /login');
    var tableName = '';
    console.log(req.body);
    if (req.body.personal === 'true') {
        tableName = 'personalShop';
    } else {
        console.log('pinvon', 'enterpriseShop');
        tableName = 'enterpriseShop';
    }

    params = [
        req.body.tel
    ];

    sql.queryByPhone(tableName, params, function (error, result) {  // 查询手机号是否注册过
        if (error) {
            throw error;
        } else {
            console.log('pinvon', result);
            if (result.length === 0) {
                back = {
                    code: 400,
                    msg: '手机号未注册, 请先注册'
                }
                return res.json(back);
            }

            if (result[0].password != req.body.password) {
                console.log('pinvon', 'password is error');
                back = {
                    code: 401,
                    msg: '密码错误'
                }
                return res.json(back);
            }

            // 写入 session
            req.session.user = {
                'tel': req.body.tel,
                'pass': req.body.password
            }

            if (result[0].shopName) {
                req.session.user.shopName = result[0].shopName;
            }

            back = {
                code: 200,
                msg: '登录成功'
            }
            return res.json(back);
        }
    });
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

router.get('/person', function(req, res, next) {
    res.render('shop/person', {tel: req.session.user.tel});
});

// 商家 Logo 以电话为文件名, 保存到 upload 文件夹
router.post('/person', upload.single('logo'), function (req, res, next) {
    console.log(req.body);
    params = [
        req.body.shopName,
        req.body.shopType,
        req.body.description,
        req.session.user.tel,
        req.body.url,
        req.session.user.tel
    ];

    // 查询店铺名是否已存在
    sql.queryByName('personalShop', [req.body.shopName], function (error, result) {
        if (error) {
            throw error;
        } else {
            if (result.length > 0) {
                back = {
                    code: 200,
                    msg: '商铺名已被注册'
                }
                return res.send(back);
            }
            sql.updateByPhone('personalShop', params, function (error, result) {
                if (error) {
                    throw error;
                } else {
                    console.log(result);
                    back = {
                        code:200,
                        msg:'保存成功'
                    }

                    // 保存店铺名到session
                    req.session.user.shopName = req.body.shopName;
                    console.log(req.session.user, 'pinvon session');
                    return res.send(back);
                }
            });
        }
    });
});

router.get('/enterprise', function(req, res, next) {
    res.render('shop/enterprise', {tel: req.session.tel});
});

router.get('/register', function (req, res, next) {
    if (JSON.stringify(req.query) == "{}") {
        console.log(req.query);
        res.render('shop/register');
	}
});

router.post('/register', function (req, res, next) {
    var tableName = '';
    console.log(typeof req.body.personal);
    if (req.body.personal === 'true') {
        console.log('pinvon', 'personalShop');
        tableName = 'personalShop';
    } else {
        console.log('pinvon', 'enterpriseShop');
        tableName = 'enterpriseShop';
    }

    params = [
        req.body.tel,
        req.body.password
    ];

    sql.queryByPhone(tableName, [req.body.tel], function (error, result) {  // 判断是否注册过
        if (error) {
            throw error;
        } else {
            if (result.length != 0) {
                back = {
                    code:400,
                    msg:'该手机号已注册过'
                }
                return res.json(back);
            }
            // 没有注册过
            sql.insertPhone(tableName, params, function (error, result) {  // 插入新用户
                if (error) {
                    throw error;
                } else {
                    console.log(result);
                    back = {
                        code:200,
                        msg:'注册成功'
                    }
                    return res.json(back);
                }
            });
        }
    })
});

router.get('/test', function (req, res, next) {
    res.sendFile('/home/pinvon/go/src/github.com/hyperledger/projects/fabric-samples/sportchain/upload/13459238667');
});
module.exports = router;
