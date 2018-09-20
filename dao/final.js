// CRUD SQL语句
var final = {
	insertPhone: 'insert into personalShop(phone, password) values(?,?)',
	queryByPhone: 'select * from personalShop where phone=?',
	queryByName: 'select * from personalShop where shopname=?',
	updateByPhone: 'update personalShop set shopname=?, category=?, introduction=?, shoplogo=?, shoplink=? where phone=?',
	queryByConditions: function (tables, columns, filter) {
		let sql = '';
		if (filter === '') {
			sql = `select ${columns} from ${tables}`;
		} else {
			sql = `select ${columns} from ${tables} where ${filter}`;
		}
		return sql;
    },
    insertByConditions: function (tables, columns, values, filter) {
        let sql = '';
        if (filter === '') {
            sql = `insert into ${tables}(${columns}) values(${values})`;
        } else {
            sql = `insert into ${tables}(${columns}) values(${values}) where ${filter}`;
        }
        return sql;
    },
    updateByConditions: function (tables, columns, filter) {  // columns: column=?
        let sql = '';
        if (filter === '') {
            sql = `update ${tables} set ${columns}`;
        } else {
            sql = `update ${tables} set ${columns} where ${filter}`;
        }
        return sql;
    },
    unionDescOrder: function (columns_1, table_1, columns_2, table_2, filter) {
        let sql = `(select ${columns_1} from ${table_1}) union (select ${columns_2} from ${table_2}) order by ${filter} desc`;
        return sql;
    },
    descByConditions: function (tables, columns, filter, order_name) {
        let sql = '';
        if (filter === '') {
            sql = `select ${columns} from ${tables} order by ${order_name} desc`;
        } else {
            sql = `select ${columns} from ${tables} where ${filter} order by ${order_name} desc`;
        }
        return sql;
    },
    queryUsersByTopic: function (topic_id) {
        let sql = 'select users.username from users,users_topic where (users_topic.users_id=users.id and users_topic.topic_id=${topic_id})';
        return sql;
    },
    queryTopicByUsers: function (username) {
        let sql = `select distinct users_topic.topic_id from users, users_topic where (users_topic.users_id=(select users.id from users where users.username=${username}))`;
        return sql;
    }
};

module.exports = final;
