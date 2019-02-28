/**
 * 快速搭建node.js服务
 */
var express = require('express'); //引入express 它是一个简洁灵活的node.js web应用框架，可快速完整搭建一个网站
var app = express(); // express本质调用了createApplication()方法且调用，返回express实例对象,app就是实例对象
const path = require('path');
var http = require('http').Server(app); // 将express注册到http中
var io = require('socket.io')(http); // 传入http服务器对象来初始化socket.io的实例

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
    console.log('a user connected')
    //接收用户进入的事件
    socket.on("enter", function(nickname) {
        console.log(nickname + "加入了群聊");
        if(online_users.indexOf(nickname) > -1) {
          // 当前用户已经存在
          socket.emit("enter-result", "no");
        } else {
          count++;
          totalCount++;
          socket.emit('enter-result', 'ok');
          //将昵称存放在用户对应的socket里面
          socket.nickname = nickname;
          //将该用户的昵称保存到在线的数组中
          online_users.push(nickname);
          //通知所有的用户，有人进来了
          io.sockets.emit("user-change", {
              name: online_users,
              action: '加入了群聊',
              count: count
          });
        }
    });
    //用户聊天信息监听
    socket.on("message", function(message) {
        console.log(message.name + "加入了群聊");
        //将信息转发给所有的用户,并携带发送信息的用户昵称
        const msg = {
            name: message.name,
            action: "加入了群聊",
            count: count
        }
        io.sockets.emit("user-message", msg);
    });
    // 用户离开时监听
    socket.on("leave", function () {
        // 找到当前要离开 的人的位置，
        var index = online_users.indexOf(socket.nickname);

        // 移除此人
        online_users.splice(index, 1);
        //通知其他人，有人离开了
        socket.broadcast.emit("user-change", online_users);

    })
})

// 启动监听，端口9000
http.listen(9000, function(){
  console.log('listening on *: 9000')
})
