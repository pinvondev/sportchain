// CRUD SQL语句
var activity = {
	insert: 'insert into activity(shopName, isAlliance, beginTime, endTime, totalCoupons, realCoupons, discount, url, energy) values(?, ?, ?, ?, ?, ?, ?, ?, ?)',
	queryByName: 'select * from activity where shopName=?',
	deleteByName: 'delete from activity where shopName=?'
};
 
module.exports = activity;