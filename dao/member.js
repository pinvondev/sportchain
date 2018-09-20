//创建memberSQL语句
var member = {
        insertmember: 'insert into enterpriseShop(shop_id, alliance_id,member_name,member_energy,member_des) values(?,?,?,?,?)',
        queryByalliance_id: 'select * from member where shop_id=?',
        deleteByalliance_id: 'delete * from member where member_name=?',
	queryByshopid:'select generator from alliance where name=?'
//        updateByPhone: 'update enterpriseShop set enterpriseName=?, registerationNumber=?, organizationCode=?, shoplink=?, legalAttribution=?, legalRepresentative=? where phone=?'
};

module.exports = member;

