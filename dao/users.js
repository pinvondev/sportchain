// CRUD SQL语句
var users = {
	insert:'INSERT INTO users(username, password, phone, email, isAdmin) VALUES(?,?,?,?,?)',
	update:'update users set name=?, pass=? where id=?',
	delete: 'delete from users where id=?',
	queryById: 'select * from users where id=?',
	queryByName: 'select * from users where username=?',
	queryAll: 'select * from users'
};

module.exports = users;
