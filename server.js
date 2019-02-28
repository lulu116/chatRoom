/**
 * 快速搭建node.js服务
 */
var express = require('express'); //引入express 它是一个简洁灵活的node.js web应用框架，可快速完整搭建一个网站
var app = express(); // express本质调用了createApplication()方法且调用，返回express实例对象,app就是实例对象
const path = require('path');
var http = require('http').Server(app); // 将express注册到http中
var io = require('socket.io')(http); // 传入http服务器对象来初始化socket.io的实例
var cp = require('child_process'); // 自动打开浏览器
// 当访问根目录时，响应的内容 hello node.js
// app.get('/', function(req, res){
//   // res.send('<h1>hello node.js!<h1>')
//   res.sendFile(__dirname + '/public/index.html')
// })


// 引入静态资源
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname+'/public'));
//是用于装在线的用户 便于随时更新在线用户
var online_users = [];
// 当前在线人数
let count = 0;
// 总访客人数
let totalCount = 0;
//Socket.io：1.一个服务端集成到node.js http服务器 socket.io 2.一个加载到浏览器中的客户端socket.io-client
//监听connection事件，接收来自客户端的sockets，并打印到控制台
io.on('connection', function(socket){
    console.log('当前有用户连接')
    let name = '';
    count++;
    totalCount++;
    //接收用户进入的事件
    socket.on("enter", function(nickname) {
        console.log(nickname,"加入了群聊");
        socket.emit('enter-result', 'ok');
        //将昵称存放在用户对应的socket里面
        socket.nickname = nickname;
        name = nickname;
        //将该用户的昵称保存到在线的数组中
        online_users.push(nickname);
        //给公众发消息
        socket.broadcast.emit("joinNoticeOther", {
            name: name,
            action: "加入了群聊",
            count: count
        });
        //给自己发消息
        socket.emit("joinNoticeSelf", {
            count: count,
            id: totalCount
        });
    });
    //用户聊天信息监听
    socket.on("message", function(message) {
        //将信息转发给所有的用户,并携带发送信息的用户昵称
        const msg = {
            name: name,
            msg: message.content
        }
        io.sockets.emit("user-message", msg);
    });
   /* // 监听到连接断开
    socket.on("leave", function() {
        count--;
        console.log(name,"离开了群聊1111111111")
        io.emit("leaveNoticeOther", {
            count: count,
            name: name,
        });
    });*/
    socket.on("disconnect", function() {
        count--;
        console.log(name + "离开了群聊")
        io.emit("disconnection", {
            count: count,
            name: name
        });
    });
})

// 启动监听，端口9000
http.listen(9000, '127.0.0.1');
console.log("Server running at http://127.0.0.1:9000/");
cp.exec('start http://127.0.0.1:9000/'); //自动打开默认浏览器
