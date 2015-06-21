// express initializes app to be a 
// function handler that you can supply to an HTTP server
var express=require('express')
var app = express();
var http = require('http').Server(app);
// the socket.io server integrates with (or mounts on) the http server provided by node
var io = require('socket.io')(http)


var morgan = require('morgan')

// so it can get the js file ??
app.use(express.static( __dirname ))

// we define a route handler / that is called when the homepage of the website is hit
app.get('/',function(req,res){
	res.sendFile(__dirname + '/index.html')
});

// listen for the connection event for when a socket is connected
// each socket also fires a disconnect message


var people_who_r_online=[]
var groups={}

io.on('connection', function(socket){
	socket.on('username', function(username){
		socket.username = username;
		people_who_r_online.push(socket.username);

		// socket.emit only emits the the specific socket
		//broadcast emits to all other sockets
		// io emits to al sockets
		io.emit('user_connected',socket.username)
		io.emit('people_online',people_who_r_online)
		io.emit('refresh_groups',groups)

		socket.on('join_group',function(group_name){
			// check if group exists and if user is not already part of group
			if ((group_name in groups) && (groups[group_name].indexOf(socket.username)===-1)){
				// add user to group name in groups
				groups[group_name].push(socket.username)
				// add user to group broadcast
				socket.join(group_name)
				io.emit('refresh_groups',groups)
				console.log(groups)
			}
			else {
				console.log('group doesnt exist or user is laready part of group')
			}
		})

		socket.on('leave_group',function(group_name){
			// check if group exists and if user is in the groups
			if ((group_name in groups) && (groups[group_name].indexOf(socket.username)>-1)){
				// get index of user in array belonging to the groups
				var index = groups[group_name].indexOf(socket.username);
				groups[group_name].splice(index,1);
				io.emit('refresh_groups',groups)
				console.log(groups)
			}
			else{
				console.log()
			}
		})

		socket.on('create_group',function(group_name){
			// check if group name is taken
			if (!(group_name in groups)){
				groups[group_name] = [];
				groups[group_name].push(socket.username);
				io.emit('refresh_groups',groups);
				socket.join(group_name)
			}
			else {
				console.log("group already exits")
			}
		})			

		socket.on('chat_message', function(msg){
				// check if it wants to send to a specoific room
				// if (array_msg[0]==="to"){
				// 	var res = msg.split(" ").slice(2).join(" ");
				// 	// str.split(" ").slice(2).join(" ");
				// 	var room=array_msg[1]
				// 	io.to(room).emit('chat message',"<b>"+room+"-"+socket.username+"</b>"+" "+ res);
				// }

				// else {
				io.emit('chat_message',socket.username,msg)
				// }
			})
		socket.on('disconnect',function(){
				// remove user from online people and broadcast a message
				var index = people_who_r_online.indexOf(socket.username);
				people_who_r_online.splice(index,1);
				io.emit('people_online',people_who_r_online)				
				io.emit('user_disconnected',socket.username)
			})
	})
})

// log all requests to server
// app.use(morgan('combined'))

// the http server is listening on port 8080
var port = 8080

http.listen(port, function(){
	console.log("listeing on port "+port)
})
