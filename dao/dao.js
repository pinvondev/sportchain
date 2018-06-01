// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var $usersSQL = require('./users');
var $shopsSQL = require('./shops');
var $activitySQL = require('./activity');
 
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
	/*
	add: function (req, res, next) {
		pool.getConnection(function(err, connection) {
			// 建立连接，向表中插入值
			// 'INSERT INTO user(id, name, age) VALUES(0,?,?)',
			connection.query($sql.insert, [req.body.uname, req.body.upwd], function(err, result) {
				if(result) {
					console.log('add');
					result = {
						code: 200,
						msg:'增加成功'
					};
					res.json(result);
				} else {
					result = {
						code: 400,
						msg: 'fail'
					};
					res.json(result);
				}
 
				// 以json形式，把操作结果返回给前台页面
				// jsonWrite(res, result);
 
				// 释放连接 
				connection.release();
			});
		});
	}, */
	queryByName: function (tableName, param, callback) {
		var sql = '';
		if (tableName === 'shops') {
			sql = $shopsSQL;
		}

		query(sql.queryByName, param, function(error, results) {
			if (error) {
				return callback(error, null);
			} else {
				return callback(null, results);
			}
		});
	}
};
