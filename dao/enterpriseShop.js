// CRUD SQL语句
var enterpriseShop = {
	insertPhone: 'insert into enterpriseShop(phone, password) values(?,?)',
	queryByPhone: 'select * from enterpriseShop where phone=?'
};
 
module.exports = enterpriseShop;