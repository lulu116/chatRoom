/**
 * @author: lulu
 * @date:
 * @desc: 聊天室
 */
var socket = null; // socket
var mynickname = null; // 记录当前用户名，以便与其他用户进行显示区分
// 用户头像
let icon = 'https://i.niupic.com/images/2018/08/10/5yxS.jpg';
$(function() {
    initSocket();
    initElements();

})
function initSocket() {
    //1. 获取socket对象，建立通信。这样建议了socket.io-client的全局io
    socket = io.connect()
    // socket = io();

    socket.on("enter-result", function(result) {
        if (result === "no") {
            //说明不允许进入
            alert("该昵称已经被占用！");
        } else {
            //允许进入
            //保存当前的昵称
            count++;
            mynickname = $("#nickname").val();
            //将登录盒子隐藏，将聊天盒子显示
            $("#login_box").css("display", "none");
            $("#chat_box").css("display", "flex");
            $('.name').text(mynickname)
        }
    });
    //接收服务器转发的信息
    socket.on("user-message", function(message) {
        var rightUserMsg = $('<div class="message-self"><div class="message-container"><div class="message-content"><div class="name">'+message.name+'</div><div class="message">'+message.msg+'</div></div><div class="icon"><img src="'+icon+'" /></div></div></div>')
        var leftUserMsg = $('<div class="message-other"><div class="message-container"><div class="icon"><img src="'+icon+'" /></div><div class="message-content"><div class="name">'+message.name+'</div><div class="message">'+message.msg+'</div></div></div></div>')
        if (message.name === mynickname) {
            //自己的信息，应该放到右边
            $(".chat-container").append(rightUserMsg);
        } else {
            //别人的信息，放到左边
            $(".chat-container").append(leftUserMsg);
        }
        //改变滚动条到最下面
        scrollToBottom()


    });
    //公众接收信息
    socket.on("joinNoticeOther", function(message) {
        $("#count").text(message.count); //当前房间人数
        const msg = {
            name: message.name,
            action: message.action
        }
        notify(msg);
    });
    //自己接收信息
    socket.on("joinNoticeSelf", function(message) {
        $("#count").text(message.count);
        $('#user_id').text(message.id)
    });
    /*// 断开连接回调事件
    socket.on("leaveNoticeOther", function(message) {
        console.log('1111111',message)
        $("#count").text(message.count);
        const notifyMessage = {
            name: message.name,
            action: "退出了群聊"
        };
        notify(notifyMessage);
    });*/
    // 断开连接回调事件
    socket.on("disconnection", function(message) {
        console.log(message);
        $("#count").text(message.count);
        const notifyMessage = {
            name: message.name,
            action: "退出了群聊"
        };
        notify(notifyMessage);
    });
}

//初始化元素
function initElements() {

    $("#enter_btn").click(function() {
        //取出输入框中的昵称
        var nickname = $("#nickname").val();
        if(!nickname) {
            alert('请输入用户名!');
            return;
        }
        //发送给服务器进行验证
        socket.emit("enter", nickname);
    });

    //发送按钮的监听事件
    $("#send_btn").click(function() {
        var content = $("#msg").val();
        if(!content) {
            alert('请输入内容!');
            return;
        }
        const message = {
           content
        };
        $("#msg").val('');
        //将内容发送给服务器
        socket.emit("message", message);

    });

    $("#head-right").click(function() {

        //发送离开信息给服务器
        socket.emit("disconnect");
        //重新加载页面
        location.reload();
    });

    $(window).unload(function() {

        //发送离开信息给服务器
        socket.emit("disconnect");

    });

}
/**
 * 发送系统通知
 *
 * @param {Object} message
 */
function notify(message) {
    const notify = '<div class="notify-container">' +
        '<div class="notify"><span class="name">' + message.name + '</span>' + message.action + '</div></div>';
    $(".chat-container").append(notify);
    scrollToBottom();
}
/**
 * 固定滚动条到底部
 */
function scrollToBottom() {
    $(".chat-container")[0].scrollTop = $(".chat-container")[0].scrollHeight;
}
