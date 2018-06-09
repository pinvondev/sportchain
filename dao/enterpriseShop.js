// CRUD SQL语句
var enterpriseShop = {
	insertPhone: 'insert into enterpriseShop(phone, password) values(?,?)',
	queryByPhone: 'select * from enterpriseShop where phone=?',
	queryByName: 'select * from enterpriseShop where enterpriseName=?',
        updateByPhone: 'update enterpriseShop set enterpriseName=?, registerationNumber=?, organizationCode=?, shoplink=?, legalAttribution=?, legalRepresentative=? where phone=?'
};
 
module.exports = enterpriseShop;
