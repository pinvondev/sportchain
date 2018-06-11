var sTel = '';
var sPassword = '';
var sPassword2 = '';
var data = {};  // 发送的数据

function register() {
    sTel = $('#num4').val();
    if(!(/^1[34578]\d{9}$/.test(sTel))) {
        return layer.msg('请输入正确的手机号码');
    }
    sPassword = $('#pass1').val();
    sPassword2 = $('#pass2').val();
    console.log(sTel, sPassword, sPassword2);
    if (sPassword != sPassword2) {
        layer.msg('密码不一致');
    }

    data = {
        tel:sTel,
        password:sPassword,
        personal:true
    };

    $.ajax({
        url:'register',
        type:'post',
        data:data,
        success: function (data, status) {
            if (status === 'success') {
                console.log(data);
                if (data.code === 200) {
                    layer.msg('注册成功');
                    setTimeout(function () {
                        location.href = '/shop/login';
                    }, 2000);
                } else if (data.code === 400) {
                    layer.msg(data.msg);
                }
            }
        },
        error: function (data, status) {
            console.log(data);
        }
    });
}

function register2() {
    sTel = $('#num2').val();
    if(!(/^1[34578]\d{9}$/.test(sTel))) {
        return layer.msg('请输入正确的手机号码');
    }
    sPassword = $('#pass3').val();
    sPassword2 = $('#pass4').val();
    console.log(sTel, sPassword, sPassword2);
    if (sPassword != sPassword2) {
        layer.msg('密码不一致');
    }

    data = {
        tel:sTel,
        password:sPassword,
        enterprise:true
    };

    $.ajax({
        url:'register',
        type:'post',
        data:data,
        success: function (data, status) {
            if (status === 'success') {
                console.log(data);
                if (data.code === 200) {
                    layer.msg('注册成功');
                    setTimeout(function () {
                        location.href = '/shop/login';
                    }, 2000);
                } else if (data.code === 400) {
                    layer.msg(data.msg);
                }
            }
        },
        error: function (data, status) {
            console.log(data);
        }
    });
};
