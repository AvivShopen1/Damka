var WebSocketServer = require('websocket').server;
var http = require('http');
 
var board = {};
var queue = [];
var games = [];

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});
 
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});
 
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}
 
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
	

    var connection = request.accept('echo-protocol', request.origin);
	
    console.log((new Date()) + ' Connection accepted.');
	
    if(queue.length == 0)
		queue.push(connection);
	else
	{
		let player1 = queue.shift();
		let game = new Game(player1, connection);
		connection.game = game;
		player1.game = game;
		games.push(game);
	}
	
	
    connection.on('message', function(message) {
		if(connection.game === null)
			return;
		
		let args = message.utf8Data.split(";");
		console.log(args);
		if(args[0] === "move")
		{
			connection.game.move_solider(args[1][0], args[1][1], args[2][0], args[2][1]);
		}else if(args[0] === "eat")
		{
			connection.game.eat(args[1]);
		}
    });
	
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

class Game
{
	
	constructor(connection1, connection2)
	{
		this.board = {};
		this.players = [connection1, connection2];
		this.turn = false;
		this.new_board();
		connection1.sendUTF("start;white");
		connection2.sendUTF("start;black");
	}
	
	new_board()
	{
		// Black
		this.create_solider("b", "8", false);
		this.create_solider("d", "8", false);
		this.create_solider("f", "8", false);
		this.create_solider("h", "8", false);
		this.create_solider("a", "7", false);
		this.create_solider("c", "7", false);
		this.create_solider("e", "7", false);
		this.create_solider("g", "7", false);
		this.create_solider("b", "6", false);
		this.create_solider("d", "6", false);
		this.create_solider("f", "6", false);
		this.create_solider("h", "6", false);
		
		// White
		this.create_solider("a", "1", true);
		this.create_solider("c", "1", true);
		this.create_solider("e", "1", true);
		this.create_solider("g", "1", true);
		this.create_solider("b", "2", true);
		this.create_solider("d", "2", true);
		this.create_solider("f", "2", true);
		this.create_solider("h", "2", true);
		this.create_solider("a", "3", true);
		this.create_solider("c", "3", true);
		this.create_solider("e", "3", true);
		this.create_solider("g", "3", true);
	}

	flip_turn()
	{
		
	}
	
	create_solider(a, b, color = false, king = false)
	{
		this.board[a + b] = {color: color, king: king};
	}
	
	remove_solider(a, b)
	{
		if(typeof(this.board[a + b]) !== "undefined")
			delete this.board[a + b];
	}
	
	move_solider(a, b, a2, b2)
	{
		let solider = this.board[a + b];
		
		if(typeof(solider) === "undefined")
			return;
		
		this.remove_solider(a, b);
		this.create_solider(a2, b2, solider.color, solider.king);
		this.send("move;" + a + b + ";" + a2 + b2);
		
		if(solider.color && b2 == 8)
			this.send("king;" + a2 + b2);
		
		if(!solider.color && b2 == 1)
			this.send("king;" + a2 + b2);
	}
	
	eat(ab)
	{
		this.send("eat;" + ab);
	}
	
	send(message)
	{
		for(var i in this.players)
		{
			this.players[i].sendUTF(message);
		}
	}
	
}