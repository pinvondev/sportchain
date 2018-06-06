var fs = require('fs');

// 提升性能
module.exports = {
  extend: function(target, source, flag) {
    for(var key in source) {
      if(source.hasOwnProperty(key)){
        flag ? (target[key] = source[key]) : (target[key] === void 0 && (target[key] = source[key]));
      }
    }
    return target;
  },
  timestampToDate: function (timestamp) {
    var date = new Date(timestamp);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = month < 10 ? ('0' + month) : month;
    var day = date.getDate();
    day = day < 10 ? ('0' + day) : day;
    var hour = date.getHours();
    hour = hour < 10 ? ('0' + hour) : hour;
    var minute = date.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    return year+'-'+month+'-'+day+' '+hour+':'+minute;
  },
  createFolder: function (path) {
    try {
      fs.accessSync(path); 
    } catch(e) {
      fs.mkdirSync(path);
    } 
  }
};
