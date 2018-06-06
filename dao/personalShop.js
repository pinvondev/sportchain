// CRUD SQL语句
var personalShop = {
	insertPhone: 'insert into personalShop(phone, password) values(?,?)',
	queryByPhone: 'select * from personalShop where phone=?',
	queryByName: 'select * from personalShop where shopname=?',
	updateByPhone: 'update personalShop set shopname=?, category=?, introduction=?, shoplogo=?, shoplink=? where phone=?'
};
 
module.exports = personalShop;