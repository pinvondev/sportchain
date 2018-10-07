// 实现与MySQL交互
var mysql = require('mysql');
var conn = mysql.createConnection({
 host: 'localhost',
 user: 'root',
 password: '123456',
 database:'sportchain',
 port: 3306
});
var $conf = require('../conf/db');
var $util = require('../utils/util');
var $usersSQL = require('./users');
var $shopsSQL = require('./shops');
var $activitySQL = require('./activity');
var $personalSQL = require('./personalShop');
var $enterpriseSQL = require('./enterpriseShop');
var $memberSQL = require('./member');
var final = require('./final');
var logger = require('../utils/logger');

// 使用连接池，提升性能
var pool  = mysql.createPool($util.extend({}, $conf.mysql));

var query = function (sql, params, callback) {
	if (typeof(params) == 'function') {
		callback = params;
		params = [];
	}
	pool.getConnection(function (err, conn) {
		if (err) {
			callback(err, null, null);
		} else {
			var query = conn.query(sql, params, callback);
			console.log('close conn');
			conn.release();
		}
	});
}

// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, ret) {
	if(typeof ret === 'undefined') {
		res.json({
			code:'1',
			msg: '操作失败'
		});
	} else {
		res.json(ret);
	}
};
 
module.exports = {
	queryAll: function (tableName, callback) {
        var tempArr = new Array();
        conn.query("select * from personalShop",function(err,results){
		if (err) {
        	throw err;
        }
		if (results) {
            console.log(results);
            for(var i = 0; i < results.length; i++){
                tempArr[i] = results[i];
            }
            return callback(null, results);
        }
        });
    },
	insert: function (tableName, params, callback) {
		var sql = '';
		if (tableName === 'activity') {
			sql = $activitySQL;
		} else if (tableName === 'users') {
			sql = $usersSQL;
		} else if (tableName === 'personalShop') {
			sql = $personalSQL;
		}

		query(sql.insert, params, function (error, result) {
			console.log('pinvon', 'add', result);
			if (error) {
				return callback(error, null);
			} else {
				return callback(null, result);
			}
		});
	},
	insertPhone: function (tableName, params, callback) {
		var sql = '';
		if (tableName === 'personalShop') {
			console.log('pinvon', 'insertByPhone personalShop');
			sql = $personalSQL;
		} else if (tableName === 'enterpriseShop') {
			sql = $enterpriseSQL;
		}

		query(sql.insertPhone, params, function (error, result) {
			if (error) {
				return callback(error, null);
			} else {
				return callback(null, result);
			}
		});
	},
	queryByName: function (tableName, param, callback) {
		var sql = '';
		if (tableName === 'shops') {
			sql = $shopsSQL;
		} else if (tableName === 'activity') {
			sql = $activitySQL;
		} else if (tableName === 'users') {
			console.log('pinvon', 'usersSQL');
            sql = $usersSQL;
		} else if (tableName === 'personalShop') {
			sql = $personalSQL;
		} else if (tableName === 'enterpriseShop') {
            sql = $enterpriseSQL;
        }
		query(sql.queryByName, param, function (error, results) {
			console.log('pinvon queryByName', sql.queryByName, param);
			if (error) {
				return callback(error, null);
			} else {
				return callback(null, results);
			}
		});
	},
	deleteByName: function (tableName, param, callback) {
		var sql = '';
		if (tableName === 'activity') {
			sql = $activitySQL;
		}

		query(sql.deleteByName, param, function (error, result) {
			if (error) {
				return callback(error, null);
			} else {
				return callback(null, result);
			}
		});
	},
	queryByPhone: function (tableName, params, callback) {
		console.log('pinvon', 'queryPhone');
		var sql = '';
		if (tableName === 'personalShop') {
			sql = $personalSQL;
		} else if (tableName === 'enterpriseShop') {
			sql = $enterpriseSQL;
		}

		query(sql.queryByPhone, params, function (error, result) {
			if (error) {
				return callback(error, null);
			} else {
				return callback(null, result);
			}
		});
	},
	updateByPhone: function (tableName, params, callback) {
		var sql = '';
		if (tableName === 'personalShop') {
			sql = $personalSQL;
		} else if ( tableName === 'enterpriseShop') {
                        sql = $enterpriseSQL;
                 //       console.log(sql);
                }
		query(sql.updateByPhone, params, function (error, result) {
			if (error) {
				return callback(error, null);
			} else {
				return callback(null, result);
			}
		});
	},
	queryActivityAndShops: function (callback) {
		var sql = $activitySQL;
		query(sql.queryActivityAndShops, function (error, result) {
			if (error) {
				return callback(error, null);
			} else {
				return callback(null, result);
			}
		});
	},
	queryByConditions: function (params) {
		return new Promise(function (resolve, reject) {
			var sql = final.queryByConditions(params[0], params[1], params[2]);
			logger.info(sql, 'pinvon queryByConditions');
			query(sql, params[3], (error, result) => {
				error ? reject(error) : resolve(result);
			});
		});
	},
	updateByConditions: function (params) {
		return new Promise(function (resolve, reject) {
			var sql = final.updateByConditions(params[0], params[1], params[2]);
            logger.debug(sql);
			query(sql, params[3], (error, result) => {
				error ? reject(error) : resolve(result);
			});
		});
	},
	unionDescOrder: function (params) {
		return new Promise(function (resolve, reject) {
			var sql = final.unionDescOrder(params[0], params[1], params[2], params[3], params[4]);
			console.log(sql);
			query(sql, (error, result) => {
				error ? reject(error) : resolve(result);
			});
		});
	},
    descByConditions: function (params) {
        return new Promise(function (resolve, reject) {
            var sql = final.descByConditions(params[0], params[1], params[2], params[3]);
            console.log('pinvon descByConditions', sql);
            query(sql, (error, result) => {
                error ? reject(error) : resolve(result);
            });
        });
    },
    insertByConditions: function (params) {
        return new Promise(function (resolve, reject) {
            var sql = final.insertByConditions(params[0], params[1], params[2], params[3]);
            logger.info(sql);
            query(sql, (error, result) => {
                error ? reject(error) : resolve(result);
            });
        });
    },
	queryByalliance_id: function (params, callback) {
        var sql = $memberSQL;
        logger.info(sql.queryByalliance_id, 'pinvon dao.js queryByalliance_id');
	    query(sql.queryByalliance_id, params, function (error, result) {
        	if (error) {
               	return callback(error, null);
          	} else {
               	logger.info('result',result);
                return callback(null, result);
            }
        });
    },
	queryByshopid: function (params, callback) {
                console.log('wlf', 'querymember');
                var sql = $memberSQL;
        query(sql.queryByshopid, params, function (error, result) {
            if (error) {
                return callback(error, null);
            } else {
		console.log('result',result);
                return callback(null, result);
            }
        });
	},
	deleteByalliance_id: function (param, callback) {
        var sql = $memberSQL;
        query(sql.deleteByalliance_id, param, function (error, result) {
            if (error) {
                return callback(error, null);
            } else {
                return callback(null, result);
            }
        });
    },
    queryUsersByTopic: function (params) { // 查找关注该话题的用户
        return new Promise(function (resolve, reject) {
            logger.info('pinvon');
            var sql = final.queryUsersByTopic(params);
            logger.info(sql);
            query(sql, (error, result) => {
                error ? reject(error) : resolve(result);
            });
        });
    },
    queryTopicByUsers: function (params) {
        return new Promise(function (resolve, reject) {
            var sql = final.queryTopicByUsers(params);
            logger.info(sql);
            query(sql, (error, result) => {
                error ? reject(error) : resolve(result);
            });
        });
    },
    deleteByConditions: function (params) {
        return new Promise(function (resolve, reject) {
            var sql = final.deleteByConditions(params);
            logger.info(sql);
            query(sql, (error, result) => {
                error ? reject(error) : resolve(result);
            });
        });
    }
}
