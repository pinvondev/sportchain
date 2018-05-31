// CRUD SQL语句
var users = {
	insert:'INSERT INTO users(id, name, pass) VALUES(0,?,?)',
	update:'update users set name=?, pass=? where id=?',
	delete: 'delete from users where id=?',
	queryById: 'select * from users where id=?',
	queryByName: 'select * from users where name=?',
	queryAll: 'select * from users'
};
 
module.exports = users;
