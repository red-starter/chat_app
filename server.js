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


var people_who_r_online={}
var groups_people_are_in={}

io.on('connection', function(socket){
		// cant emit connectionz cuz becomes infinite loop
		// io.emit('connectionz','A user has connected')

		socket.on('username', function(username){

			socket.username = username;
			// now the local username is saved
			// hash tbale of people who are online
			people_who_r_online[socket.username] = true

			io.emit('user connected',socket.username)
			io.emit('people online',people_who_r_online)				

			socket.on('chat message', function(msg){
				var array_msg = msg.split(" ")
				console.log(array_msg[0]=="join")
				// check if it wants to join a room
				if (array_msg[0]==='join'){
					io.emit('chat message',"<b>"+socket.username+" joined the room "+array_msg[1]+"</b>")
					socket.join(array_msg[1])					
				}

				//check ot it wanst to leave a room
				else if (array_msg[0]==='leave'){
					io.emit('chat message',"<b>"+socket.username+" left the room "+array_msg[1]+"</b>")
					socket.leave(array_msg[1])	
				}
				// check if it wants to send to a specoific room
				else if (array_msg[0]==="to"){
					var res = msg.split(" ").slice(2).join(" ");
					// str.split(" ").slice(2).join(" ");
					var room=array_msg[1]
					io.to(room).emit('chat message',"<b>"+room+"-"+socket.username+"</b>"+" "+ res);
				}

				else {
					io.emit('chat message',socket.username,msg)
				}
			})
			socket.on('disconnect',function(){
				delete people_who_r_online[socket.username]
				io.emit('people online',people_who_r_online)				
				io.emit('user disconnected', "<b>"+socket.username+" "+"left the conversation"+"</b>",people_who_r_online)
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
