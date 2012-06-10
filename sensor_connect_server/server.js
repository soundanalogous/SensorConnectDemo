/* 
 * Simple websocket server
 * fallback code from: https://gist.github.com/1219165
 *
 * Supports WebSocket drafts 75, 76 and 10 
 */

var WebSocketRequest = require('websocket').request,
		ws = require('websocket-server'),
    express = require('express');

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

/* node-websocket-server fallback to drafts 75 and 76 */
var miksagoConnection = require('./node_modules/websocket-server/lib/ws/connection');

var miksagoServer = ws.createServer();
miksagoServer.server = httpServer;

miksagoServer.addListener('connection', function(connection) {
	// Add remoteAddress property
	connection.remoteAddress = connection._socket.remoteAddress;

	// use 'sendUTF' regardless of the server implementation
	connection.sendUTF = connection.send;
	handleConnection(connection);
});

/* WebSocket-Node config */
var wsServerConfig = {
	// all options *except* 'httpServer' are required when bypassing
	// WebSocketServer
	maxReceivedFrameSize: 0x10000,
	maxReceivedMessageSize: 0x100000,
	fragmentOutgoingMessages: true,
	fragmentationThreshold: 0x4000,
	keepalive: true,
	keepaliveInterval: 20000,
	assembleFragments: true,
	// autoAcceptConnections is not applicable when bypassing WebSocketServer
	// autoAcceptConnections: false,
	disableNagleAlgorithm: true,
	closeTimeout: 5000
};

// Handle the upgrade event ourselves instead of using WebSocketServer
httpServer.on('upgrade', function(req, socket, head) {
    if (typeof req.headers['sec-websocket-version'] !== 'undefined') {

        // WebSocket hybi-08/-09/-10 connection (WebSocket-Node)
        var wsRequest = new WebSocketRequest(socket, req, wsServerConfig);
        try {
            wsRequest.readHandshake();
            var wsConnection = wsRequest.accept(wsRequest.requestedProtocols[0], wsRequest.origin);
            handleConnection(wsConnection);
        }
        catch(e) {
            console.log("WebSocket Request unsupported by WebSocket-Node: " + e.toString());
            return;
        }

    } else {

        // WebSocket hixie-75/-76/hybi-00 connection (node-websocket-server)
        if (req.method === 'GET' &&
            (req.headers.upgrade && req.headers.connection) &&
            req.headers.upgrade.toLowerCase() === 'websocket' &&
            req.headers.connection.toLowerCase() === 'upgrade') {
            new miksagoConnection(miksagoServer.manager, miksagoServer.options, req, socket, head);
        }
    }
});

/* A common connection handler */
function handleConnection(connection) {
    var thisConnection;
    connections.push(connection);

    console.log((new Date()) + " Connection accepted.");
    
    connection.addListener('message', function(message) {

        thisConnection = connection;

        broadcast(thisConnection, message);
    });
    
    connection.addListener('close', function() {
        var index = connections.indexOf(connection);

        if (index !== -1) {
            connections.splice(index, 1);
        }
      
        console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
    });
}

function broadcast(thisConnection, message) {
    if (message.type === 'utf8') {
        connections.forEach(function(destination) {
            if (thisConnection !== destination) {
                destination.sendUTF(message.utf8Data);
            }
        });
    } else {
        //console.log("non utf8 message"); // safari
        connections.forEach(function(destination) {
            if (thisConnection !== destination) {
                destination.send(message);
            }
        });
    }
}
