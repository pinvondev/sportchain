// CRUD SQL语句
var activity = {
	insert: 'insert into activity(shopName, isAlliance, beginTime, endTime, totalCoupons, realCoupons, discount, url) values(?, ?, ?, ?, ?, ?, ?, ?)'
};
 
module.exports = activity;