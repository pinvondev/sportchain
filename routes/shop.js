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
var info = require('../utils/string');
var formidable = require("formidable");
var path = require('path');
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
        logger.debug(result);
        file_path=`public/upload/${req.session.user.tel}/`;
        product = {};
        var index=0;
        var str='a';
        fs.readdir(file_path, (err, files) => {
            files.forEach(file => {
                var num1 = 'a'.charCodeAt()+index;
                product[String.fromCharCode(num1)] = `upload/${req.session.user.tel}/${file}`;
                desc_path=`${file_path}${path.parse(file).name}.txt`;
                if (fs.existsSync(desc_path)) {
                    logger.debug(desc_path);
                    var num2 = 'A'.charCodeAt()+index;
                    product[String.fromCharCode(num2)] = fs.readFileSync(desc_path);
                }
                index++;
            });
            logger.debug(product);
            return res.render('shop/', { shop: result[0], product: product});
        });
    })
    .catch((error) => {
        throw error;
    });
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
    logger.info('pinvon', 'post /login', req.body);
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
//	    if(result[0].shopname){
//	    	paramss = [
//       			 result[0].shopname
//   	    	];
//	    }
//    		sql.queryByshopid(paramss,function(error,result1) {
//                	if(error){
//				throw error;
//			}else{
//	    		if(result1.name){
//				req.session.user.alliancename = result1.name;	
//	 		}else{
//				console.log('未找到联盟名')
//			}
//			}
//		});
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

// 已有联盟
router.get('/my_alliance', function (req, res, next) {
    params = [
        'alliance',
        'id, name, generator, generate_time, join_condition',
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

// 我的联盟
router.get('/rmy_alliance', function (req, res, next) {
    // 获取商家名
    params = [ req.session.user.name ];
    // 根据商家名查询其创建的联盟
    logger.info(req.session.user, 'pinvon rmy_alliance');
    sql.queryByalliance_id(params, function (error, result) {
        if (error) {
            logger.info(error);
        } else {
            var temp = new Array();
            logger.info(result, 'pinvon queryByalliance_id');
             for(var i = 0; i< result.length; i++){
                temp[i] = result[i];
             }
            return res.render('shop/myalliance', {results:temp});
        }
    });
});

router.get('/del_member',function(req, res, next) {
    var	param = ['NIKE'];
	sql.deleteByalliance_id(param, function (error, result) {
                if (error) {
                    throw error;
                } else {
                    console.log(result);
                    back = {
                        code:200,
                        msg:'删除成功'
                    }
                }
            });
});

router.get('/alliance_list', function (req, res, next) {
    return res.render('shop/malloc_list');
});

router.get('/create_channel', function (req, res, next) {
    // 判断是个人商家还是企业商家
    var table_name = '';
    if (req.session.user.personal == 'true') {
        table_name = 'personalShop';
    } else {
        table_name = 'enterpriseShop';
    }
    var params = [
        table_name,
        'energy',
        'phone=?',
        req.session.user.tel
    ];
    // 验证能量值是否满足要求
    sql.queryByConditions(params)
    .then((result) => {
        logger.debug(result, 'pinvon');
        if (result[0].energy >= 0) {
            // 验证是否已创建过联盟
            logger.debug('create alliance pinvon');
            var params_alliance = [
                'alliance',
                'id',
                'generator=?',
                req.session.user.name
            ];
            sql.queryByConditions(params_alliance)
            .then((result) => {
                logger.debug(result);
                if (result.length > 0) {
                    logger.info(req.session.user.name+'  当前已经有联盟');
                    return res.json(req.session.user.name+'  当前已经有联盟');
                }
                logger.info(req.session.user.name+'  当前没有创建联盟');
                logger.info('开始创建联盟...');
                var params_insert = [
                    'alliance',
                    'name, generator, generate_time, join_condition, member',
                    `"${req.session.user.name}", "${req.session.user.name}", now(), "energy>100", 1`,
                    ''
                ];
                sql.insertByConditions(params_insert)
                .then((result) => {
                    logger.debug(result);
                    // create_channel();  // 区块链
                    return res.json('联盟创建成功');
                })
                .catch((error) => {
                    throw error;
                });
            })
            .catch((error) => {
                throw error;
            });
        }
    })
    .catch((error) => {
        throw error;
    });
});

// 商家申请加入联盟
router.get('/application_for_alliance/:id', function (req, res, next) {
    // 参数为用户要加入的联盟的 id
    logger.debug('进入');
    logger.debug(req.params);
    console.log(req.body.alliance_name);

    // 验证该用户是否已加入过该联盟
    var params_query_member = [
        'member',
        'id',
        `(alliance_id=${req.params.id})`
    ];
    sql.queryByConditions(params_query_member)
    .then((result) => {
        logger.debug(result);
        if (result.length > 0) {
            logger.info(info.shop_in_alliance);
            return res.json(info.shop_in_alliance);
        }
        // 验证用户是否达到加入联盟的条件
        var table_name = '';
        if (req.session.user.personal == 'true') {
            table_name = 'personalShop';
        } else {
            table_name = 'enterpriseShop';
        }
        var params_query_shop = [
            table_name,
            'energy',
            'phone=?',
            req.session.user.tel
        ];
        sql.queryByConditions(params_query_shop)
        .then((result) => {
            logger.debug(result);
            if (result[0].energy > 0) {  // 联盟的限制条件需读取数据库
                logger.info(info.shop_get_condition);
                var params_insert_application = [
                    'application_for_alliance',
                    `shop_name, alliance_id, energy`,
                    `"${req.session.user.name}", ${req.params.id}, "${result[0].energy}"`,
                    ''
                ];
                sql.insertByConditions(params_insert_application)
                .then((result) => {
                    logger.debug(result);
                    data = {
                        code: 200,
                        msg: '已提交申请'
                    }
                    res.json(data);
                })
                .catch((error) => {
                    throw error;
                });
            }
        });
    })
    .catch((error) => {
        throw error;
    });
});

// 联盟创建者同意加入联盟
router.get('/agree', function (req, res, next) {
    // 前端参数: 申请加入的商家名; 联盟名;
    member_name = req.query.member_name;
    alliance_name = req.query.alliance_name;
    // 删除 application_for_alliance 中的商家
    var params_delete_application = [
        'application_for_alliance',
        `shop_name="${member_name}" and alliance_name="${req.session.user.name}"`
    ];
    sql.deleteByConditions(params_delete_application)
    .then((result) => {
        // 插入商家到 member
        var params_insert_member = [
            'member',
            'generator, alliance_name, member_name, member_des',
            `"${req.session.user.name}", "${alliance_name}", "${member_name}", "${member_des}"`,
            ''
        ];
        sql.insertByConditions(params_insert_member)
        .then((result) => {
            logger.info(result);
            // 更新 alliance 中的 member 数量
            params_update_alliance = [
                'alliance'
                `member=member+1`,
                `alliance_name=${req.session.user.name}`
            ];
            sql.updateByConditions(params_update_alliance)
            .then((result) => {
                data = {
                    code: 200,
                    msg: '已成功加入联盟'
                };
                res.json(data);
            })
            .catch((error) => {
                throw error;
            });
        }).catch((error) => {
            throw error;
        });
    }).catch((error) => {
        throw error;
    });
});

// 上传商品图片
router.post('/upload', function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(error, fields, files) {
        image_path=`upload/${req.session.user.tel}/${files.upload.name}`;
        desc_path=`upload/${req.session.user.tel}/${path.parse(image_path).name}.txt`;
        logger.debug(desc_path);
        fs.writeFileSync("public/"+image_path, fs.readFileSync(files.upload.path));
        fs.writeFileSync("public/"+desc_path, fields.desc);
        res.redirect("/shop");
    });
});
function create_alliance() {
    shell.cd('network/first-network/');
    shell.exec('./create_channel 2 mychannel2');
}

function add_org() {
    shell.cd('network/first-network/');
    shell.exec('./eyfnn.sh -m up -n 3 -a 2');
}

module.exports = router;
