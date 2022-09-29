const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const SocketIOFileUpload = require('socketio-file-upload');
const { Server } = require("socket.io");
const io = new Server(server);

const { v4: uuidv4 } = require('uuid');
const { Socket } = require('net');

/*######### constants #########*/
var users = [];
app
.use(SocketIOFileUpload.router)
.use(express.static(__dirname));
var t="";
var ofn ="";
io.on ('connection',socket=> {
	
 	console.log('New user connected');
 	//for uploadig
 	var uploader = new SocketIOFileUpload();
 	uploader.dir = "./uploads";
 	uploader.listen(socket);
 	//socket events
 	socket.on('register', name=>{
				socket.username = name;
				users.push(name);

 		socket.emit('joined', socket.username);
 		io.emit('userlist', users);
	});
	socket.on('chat', msg=>{
		//console.log (`${msg} from ${socket.username}`);
		socket.broadcast.emit('message', {from:socket.username, msg:msg})
	});
	//uploader events
	uploader.on("start", function(event){
	
        var old_name = event.file.name
		ofn = old_name;
        var arr = old_name.split('.');
       
		var new_name = uuidv4()+'.'+arr[arr.length - 1];
		if(['png', 'jpg', 'jpeg', 'gif', 'svg'].indexOf(arr[arr.length - 1])>=0) {
			t='image';
		}
		else{
			t='file';
		}
		console.log(t);
        return event.file.name = new_name;
    });
	
	uploader.on("saved", function(event){
	
		io.emit('uploaded', {from: socket.username, file:event.file.name, type:t, ofn:ofn});
    });
    uploader.on("error", function(event){
        console.log("Error from uploader", event);
    });
});
server.listen(8005, () => {
  console.log('listening on http://localhost:8005');
});

