var express = require('express'  ); // Simple nodejs utilities
var socket  = require('socket.io'); // socket library
var app     = express();            // our app
var server  = app.listen(3001);     // the server is now listening on port 3001
var io      = socket(server);       // create the io object based on our server
app.use(express.static('public'))   // will use static file paths, only look at whats there once
io.sockets.on('connection', newConnection); // Register callback for new connection
console.log("Server up and running!"); // inform that everything is ok
function newConnection(socket){
  console.log("Oi! you have a connection m8!");
  console.log(socket.id);
  socket.on('player', sendInfo);
  function sendInfo(data){
    // console.log("<",data);
    var id=socket.id
    socket.broadcast.emit('player',{data,id});
    // console.log(">",data);
  }
}
