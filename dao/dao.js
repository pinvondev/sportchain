// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var $usersSQL = require('./users');
var $shopsSQL = require('./shops');
var $activitySQL = require('./activity');
var $personalSQL = require('./personalShop');
var $enterpriseSQL = require('./enterpriseShop');
 
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
	queryAll: function (tableName, params, callback) {
		if (tableName === 'shops') {
			query($shopsSQL.queryAll, [params.id], function (error, results) {
				if (error) {
					return callback(error, null);
				} else {
					return callback(null, results);
				}
			});
		}
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
		} else if (tableName === 'personalShop') {
			sql = $personalSQL;
		}

		query(sql.queryByName, param, function (error, results) {
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
	}
};
