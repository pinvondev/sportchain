var fileList;
$(function() {
    var delParent;
    var defaults = {
        fileType: ["jpg", "png", "bmp", "jpeg"],
        fileSize: 1024 * 1024 * 10
    };

    $(".file").change(function() {
        var idFile = $(this).attr("id");
        var file = document.getElementById(idFile);
        var imgContainer = $(this).parents(".aui-photo");
        fileList = file.files;
        console.log('pinvon', fileList[0]);
        var input = $(this).parent();
        var imgArr = [];
        var numUp = imgContainer.find(".aui-up-section").length;
        var totalNum = numUp + fileList.length;
        if (fileList.length > 1 || totalNum > 1) {
            alert("你好！上传图片不得超过2张");
        } else if (numUp < 3) {
            fileList = validateUp(fileList);
            for (var i = 0; i < fileList.length; i++) {
                var imgUrl = window.URL.createObjectURL(fileList[i]);
                imgArr.push(imgUrl);
                var $section = $("<section class='aui-up-section fl loading'>");
                imgContainer.prepend($section);
                var $span = $("<span class='aui-up-span'>");
                $span.appendTo($section);
                var $img0 = $("<img class='aui-close-up-img'>").on("click", function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    $(".aui-works-mask").show();
                    delParent = $(this).parent();
                });
                $img0.attr("src", "/images/close.png").appendTo($section);
                var $img = $("<img class='aui-to-up-img aui-up-clarity'>");
                $img.attr("src", imgArr[i]);
                $img.appendTo($section);
                var $p = $("<p class='img-aui-img-name-p'>");
                $p.html(fileList[i].name).appendTo($section);
                var $input = $("<input id='actionId' name='actionId' value='' type='hidden'>");
                $input.appendTo($section);
                var $input2 = $("<input id='tags' name='tags' value='' type='hidden'/>");
                $input2.appendTo($section);
            }
        }
        setTimeout(function() {
            $(".aui-up-section").removeClass("loading");
            $(".aui-to-up-img").removeClass("aui-up-clarity");
        }, 4100);
        numUp = imgContainer.find(".aui-up-section").length;
        if (numUp >= 3) {
            $(this).parent().hide();
        }
        $(this).val("");
    });
    $(".aui-photo").delegate(".aui-close-up-img", "click", function() {
        $(".aui-works-mask").show();
        delParent = $(this).parent();
    });
    $(".aui-accept-ok").click(function() {
        $(".aui-works-mask").hide();
        var numUp = delParent.siblings().length;
        if (numUp < 3) {
            delParent.parent().find(".aui-file-up").show();
        }
        delParent.remove();
    });
    $(".aui-accept-no").click(function() {
        $(".aui-works-mask").hide();
    });
    function validateUp(files) {
        var arrFiles = [];
        for (var i = 0, file; file = files[i]; i++) {
            var newStr = file.name.split("").reverse().join("");
            if (newStr.split(".")[0] != null) {
                var type = newStr.split(".")[0].split("").reverse().join("");
                console.log(type + "===type===");
                if (jQuery.inArray(type, defaults.fileType) > -1) {
                    if (file.size >= defaults.fileSize) {
                        alert(file.size);
                        alert('您这个"' + file.name + '"文件大小过大');
                    } else {
                        arrFiles.push(file);
                    }
                } else {
                    alert('您这个"' + file.name + '"上传类型不符合');
                }
            } else {
                alert('您这个"' + file.name + '"没有类型, 无法识别');
            }
        }
        return arrFiles;
    }
});

function checkna(){
    na=form1.yourname.value;
    if( na.length <1 || na.length >6)
    {
        divname.innerHTML='<font class="tips_false">长度是1~6个字符</font>';
    }else{
        divname.innerHTML='<font class="tips_true">输入正确</font>';
    }
}

function checkpsd1(){
    na=form1.youphone.value;
    if( na.length <11 || na.length >11)
    {
        phone.innerHTML='<font class="tips_false">必须是11位的数字</font>';
    }else{
        phone.innerHTML='<font class="tips_true">输入正确</font>';
    }
}

function checkpsd2(){
    na=form1.youziz.value;
    if( na.length <18 || na.length >18)
    {
        zizhi.innerHTML='<font class="tips_false">必须是18位社会信用代码</font>';
    }else{
        zizhi.innerHTML='<font class="tips_true">输入正确</font>';
    }
}

$('#submit').click(function (){
    console.log('pinvon', 'touch submit');
    data = {
        file: fileList[0]
    };
    $.ajax({
        url:'person',
        type:'post',
        data:data,
        success: function(data, status) {
            console.log('success');
        },
        error: function(data, status) {
            console.log('fail');
        }
    });
});