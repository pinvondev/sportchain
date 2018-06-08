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
            sql = `insert into ${tables}(${columns}) values${values}`;
        } else {
            sql = `insert into ${tables}(${columns}) values${values} where ${filter}`;
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
    }
};
 
module.exports = final;