/* 
 * Simple websocket server
 */

var express = require('express'),
    io = require('socket.io');

var connections = [];
	
var httpServer = express.createServer();

httpServer.configure(function() {
  httpServer.use(express.static(__dirname + "/public"));
  httpServer.set('views', __dirname);
  httpServer.set('view engine', 'ejs');
});

httpServer.get('/', function(req, res) {
  res.render('index', { layout: false });
});

httpServer.listen(8080, function() {
	console.log((new Date()) + " Server is listening on port 8080");
});

io.sockets.on('connection', function(socket) {

    // var thisConnection;
    // connections.push(connection);

    console.log((new Date()) + " Connection accepted.");    
    
    socket.on('message', function(message) {
        //thisConnection = connection;

        //broadcast(thisConnection, message);
        socket.broadcast.emit(message);
    });

    socket.on('disconnect', function() {
        console.log("disconnected");
        // var index = connections.indexOf(connection);

        // if (index !== -1) {
        //     connections.splice(index, 1);
        // }
      
        // console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
    });

});

// function broadcast(thisConnection, message) {
//     if (message.type === 'utf8') {
//         connections.forEach(function(destination) {
//             if (thisConnection !== destination) {
//                 destination.sendUTF(message.utf8Data);
//             }
//         });
//     } else {
//         //console.log("non utf8 message"); // safari
//         connections.forEach(function(destination) {
//             if (thisConnection !== destination) {
//                 destination.send(message);
//             }
//         });
//     }
// }
