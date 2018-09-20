var express = require('express');
var sql = require('../dao/dao');
var utils = require('../utils/util');
var multer = require('multer');
var ip = require('ip');
var userfabric = require('../fabric/user');
var stepfabric = require('../fabric/step');
var router = express.Router();
var fs = require('fs');
var callfile = require('child_process');
var shell = require('shelljs');
var logger = require('../utils/logger');
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
        cb(null, file.originalname);  
    }
});

// 通过 storage 选项来对 上传行为 进行定制化
var upload = multer({ storage: storage });

/* GET shop page. */
router.get('/', function(req, res, next) {
    if (req.session === undefined || req.session.user === undefined || req.session.user.tel === undefined) {  // 未登录
        logger.info('pinvon', 'undefined');
        return res.redirect('../shop/login');
    }

    params = [
        'personalShop',
        'shopname',
        'phone=?',
        req.session.user.tel
    ];
    sql.queryByConditions(params)
        .then((result) => {
            if (result[0].shopname.length <= 0) {
                return res.redirect('../shop/person');
            }
        })
        .catch((error) => {
            return console.log(error);
        });

    params = ['personalShop', '*', 'phone=?', [req.session.user.tel]];
    sql.queryByConditions(params)
        .then((result) => {
            console.log(result);
            return res.render('shop/', { shop: result[0] });
        })
        .catch((error) => {
            throw error;
        })
});

router.get('/login', function (req, res, next) {
    if (JSON.stringify(req.query) == "{}") {
	logger.info(req.query);
	return res.render('shop/login');
    } 
});

router.post('/login', function (req, res, next) {
    logger.info('pinvon', 'post /login');
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
                'pass': req.body.password,
                'personal': req.body.personal
            }
	    if(result[0].shopname){
	    	paramss = [
       			 result[0].shopname
   	    	];
	    }
    		sql.queryByshopid(paramss,function(error,result1) {
                	if(error){
				throw error;
			}else{
	    		if(result1.name){
				req.session.user.alliancename = result1.name;	
	 		}else{
				console.log('未找到联盟名')
			}
			}
		});
            if (result[0].shopname) {
                req.session.user.name = result[0].shopname;
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
    logger.debug('pinvon req.session\n', req.session, '\n');
    var shop_params = [];
    var results = {};
    if (req.session.user.personal) {
        shop_params.push(
            'personalShop',
            '*',
            'phone=?',
            req.session.user.tel
        );
    } else {
        shop_params.push(
            'enterpriseShop',
            'id, enterpriseName as shopName, shopLogo as shoplogo, shoplink, email, energy',
            'phone=?',
            req.session.user.tel
        );
    }
    console.log('pinvon shop_params', shop_params);
    sql.queryByConditions(shop_params)
    .then((shop_result) => {
        console.log('pinvon shop_result', shop_result);
        sql.queryByName('activity', [req.session.user.name], function (error, result) {
            if (error) {
                throw error;
            } else if (result.length === 0) {// 如果未设置活动
                console.log('pinvon result.length', result);
                results.shop_info = shop_result[0];
                return res.render('shop/activity', {result: results});
            } else if (result[0].endTime < Date.parse(new Date())) {// 如果活动时间已过, 则从表中删除该活动记录
                console.log('pinvon', 'timeout');
                sql.deleteByName('activity', [req.session.user.name], function (error, result) {
                    if (error) {
                        throw error;
                    } else {
                        results.shop_info = shop_result[0];
                        return res.render('shop/activity', {result: results});
                    }
                });
            } else {
                // 如果已经设置过活动时间, 则显示活动细节
                console.log('pinvon result', result[0]);
                beginTime = utils.timestampToDate(result[0].beginTime);
                result[0].beginTime = beginTime;

                endTime = utils.timestampToDate(result[0].endTime);
                result[0].endTime = endTime;
                results.shop_info = shop_result[0];
                results.activity_info = result[0]
                console.log('pinvon results', results);
                return res.render('shop/activity', {result: results});
            }
        });
    })
    .catch((error) => {
        throw error;
    })
    
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
            return res.json(response);
        }
    });
});

router.get('/rank', function(req, res, next) {
    params = [
        'personalShop',
        'shoplogo, shopname as enterpriseName, introduction as description, phone, id',
        ''
    ]
    sql.queryByConditions(params)
    .then((result) => {
        var temp = new Array();
        for(var i = 0; i< result.length; i++){
            temp[i] = result[i];
        }
	    var data = { data: result };
        console.log('pinvon', data);
	    return res.json(data);
    })
    .catch((error) => {
        throw error;
    });
});

router.get('/rank1', function(req, res, next) {
    //    res.render('shop/rank');
    params = [
        'personalShop',
        '*',
        '',
        'energy'
    ]
    sql.descByConditions(params)
        .then((result) => {
            var temp = new Array();
            for(var i = 0; i< result.length; i++){
                temp[i] = result[i];
            }
            return res.render('shop/rank',{ title:'test', results:temp });
        })
        .catch((error) => {
                throw error;
                console.log(error);
        });
});


router.get('/person', function(req, res, next) {
    return res.render('shop/person', {tel: req.session.user.tel});
});

// 商家 Logo 以电话为文件名, 保存到 upload 文件夹
router.post('/person', upload.single('logo'), function (req, res, next) {
    console.log(req.body);
    params = [
        req.body.shopName,
        req.body.shopType,
        req.body.description,
        'http://123.207.62.191' + ':3000/upload/' + req.session.user.tel + '/' + req.file.originalname,
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
                    code: 400,
                    msg: '商铺名已被注册'
                }
                return res.render('shop/person', {code: back.code});
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
                    req.session.user.name = req.body.shopName;
                    console.log(req.session.user, 'pinvon session');
                    return res.render('shop/person', {code: back.code});
                }
            });
        }
    });
});

router.get('/enterprise', function(req, res, next) {
    res.render('shop/enterprise', {tel: req.session.user.tel});
});

router.post('/enterprise', upload.array('file', 20), function (req, res, next) {
        var tels = req.session.user.tel;
        console.log("tels:",tels);
        params = [
          req.body.yourname,
          req.body.youphone,
          req.body.youphone1,
          req.body.url,
          req.body.style_c,
          req.body.yourname1,
         req.session.user.tel
        ];
        console.log("tel",params);
        console.log("data:",req.body.yourname);
         sql.queryByName('enterpriseShop', [req.body.yourname], function (error, result) {
        console.log(req.body.yourname);
          if (error) {
            throw error;
        } else {
            if (result.length > 0) {
                back = {
                    code: 200,
                    msg: '店铺名已被注册'
                }
                return res.send(back);
            }
            sql.updateByPhone('enterpriseShop', params, function (error, result) {
                if (error) {
                    throw error;
                } else {
                    console.log(result);
                    back = {
                        code:200,
                        msg:'保存成功'
                    }

                    // 保存店铺名到session
                    req.session.user.name = req.body.yourname;
                    return res.render('shop/enterprise',{code:back.code});
                }
            });
        }
    });
});


router.get('/register', function (req, res, next) {
//    if (JSON.stringify(req.query) == "{}") {
        console.log(req.query);
        return res.render('shop/register');
//    }
});

router.post('/register', function (req, res, next) {
    var tableName = '';
    console.log(typeof req.body.personal);
    if (req.body.personal === 'true') {
        tableName = 'personalShop';
    } else {
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
            userfabric.registerUser(req.body.tel, function(isRegister, msg) {
                if (!isRegister) {
                    result = {
                        code: 400,
                        msg: msg
                    }
                    res.json(result);
                } else {
                    var args = [req.body.tel, '0', '0'];
                    stepfabric.step(req.body.tel, 'setEnergy', args, function (error, result) {  // 注册时商家上链
                        if (error) {
                            console.log(error);
                        } else {
                            if (result && result[1] && result[1].event_status === 'VALID') {
                                sql.insertPhone(tableName, params, function (error, result) {  // 插入新用户
                                    if (error) {
                                        throw error;
                                    } else {
                                        console.log('pinvon register shop', result);
                                        back = {
                                            code:200,
                                            msg:'注册成功'
                                        }
                                        return res.json(back);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    })
});

router.get('/alliance', function (req, res, next) {
    return res.render('shop/alliance');
});

// 我的联盟
router.get('/my_alliance', function (req, res, next) {
    params = [
        'alliance',
        'name, generator, generate_time, join_condition',
        ''
    ];
    sql.queryByConditions(params)
        .then((result) => {
            var temp = new Array();
            logger.info(result);
             for(var i = 0; i< result.length; i++){
                temp[i] = result[i];
             }
            return res.render('shop/malloc_alliance', {results:temp});
        })
        .catch((error) => {
            return console.log(error);
        });
});

router.get('/rmy_alliance', function (req, res, next) {
    params = [
	req.session.user.alliancename
    ];
    sql.queryByalliance_id(params)
	.then((result) => {
		var temp = new Array();
		logger.info(result);
		for(var i = 0;i< result.length; i++){
		    temp[i] = result[i];
		}
	        return res.render('shop/myalliance',{results:temp});	
	})
	.catch((error) => {
		return console.log(error);
	});
});

router.get('/alliance_list', function (req, res, next) {
    return res.render('shop/malloc_list');
});

router.get('/test_alliance', function (req, res, next) {
    shell.cd('network/first-network/');
    shell.exec('./eyfnn.sh -m up -n 3 -a 2');
});

router.get('/test_addchannel', function (req, res, next) {
    shell.cd('network/first-network/');
    shell.exec('./create_channel 2 mychannel2');
});

module.exports = router;
