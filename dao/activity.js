// CRUD SQL语句
var activity = {
	insert: 'insert into activity(shopName, isAlliance, beginTime, endTime, totalCoupons, realCoupons, discount, url, energy) values(?, ?, ?, ?, ?, ?, ?, ?, ?)',
	queryByName: 'select * from activity where shopName=?',
	deleteByName: 'delete from activity where shopName=?',
	queryActivityAndShops: 'select * from activity, shops where activity.shopName=shops.name order by shops.energy desc'
};
 
module.exports = activity;