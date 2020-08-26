// Constants (Modules)
const 
WebSocketServer = require('websocket').server, 
http = require('http'), 
shortid = require('shortid');
 
 // Variables (Global Scope)
var queue = [], games = {},

// Open a websocket server based on http (for browser connections)

server = http.createServer(function(request, response) {
	// Ignore web pages requests
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(8080, function() {
    console.log('Server is listening on port 8080');
});

 
wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});
 
function addChar(charac, add)
{
	if(charac === null || charac.length !== 1)
		return null;
		
	return String.fromCharCode(charac.charCodeAt(0) + add);
}
 
wsServer.on('request', function(request) {
	
    var connection = request.accept('echo-protocol', request.origin);
	
    console.log((new Date()) + ' Connection accepted.');
	
    if(queue.length == 0)
	{
		queue.push(connection);
		connection.game = null;
	}else
	{
		let player1 = queue.shift();
		let game = new Game(player1, connection);
		connection.game = game;
		player1.game = game;
	}
	
	
    connection.on('message', function(message) {
		if(connection.game === null)
			return;
		
		let args = message.utf8Data.split(";"), game = connection.game;
		
		if(args[0] === "move")
		{
			game.move_solider(args[1][0], args[1][1], args[2][0], args[2][1]);
		}else if(args[0] === "eat")
		{
			game.eat(args[1]);
		}else if(args[0] === "move_again")
		{
			if(game.turn !== connection.color)
				game.flip_turn();
		}
    });
	
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
		
		if(connection.game === null)
		{
			// In the event of a menu disconnection, clear the queue.
			queue.length = 0;
		}else
		{
			connection.game.winner = !connection.color;
			connection.game.game_over("quit");
		}
    });
});

class Game
{
	
	constructor(connection1, connection2)
	{
		this.id = shortid.generate();
		this.board = {};
		this.players = [connection1, connection2];
		this.turn = false;
		this.timer = 30;
		this.winner = null;
		this.ended = false;
		this.new_board();
		this.solider_count = [12, 12];
		
		connection1.color = true;
		connection1.sendUTF("start;white");
		
		connection2.color = false;
		connection2.sendUTF("start;black");
		
		this.timer_interval = setInterval(() => {
			--this.timer;
			
			if(this.timer <= 0)
			{
				this.flip_turn();
			}
		}, 1000);
		
		games[this.id] = this;
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
	
	reset_timer()
	{
		this.timer = 30;
		this.send("timer;reset");
	}

	flip_turn()
	{
		if(this.turn)
		{
			this.players[1].sendUTF("turn;true");
			this.players[0].sendUTF("turn;false");
		}else
		{
			this.players[0].sendUTF("turn;true");
			this.players[1].sendUTF("turn;false");
		}
		
		this.turn = !this.turn;
		this.reset_timer();
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
	
	hasSolider(a, b)
	{
		return a.charCodeAt(0) < 97 || a.charCodeAt(0) > 104 || b < 1 || b > 8 || typeof(this.board[a + b]) !== "undefined";
	}
	
	canMove(a, b)
	{
		let y = parseInt(b);
		return !(this.hasSolider(addChar(a, 1), y + 1) && this.hasSolider(addChar(a, -1), y + 1) && this.hasSolider(addChar(a, 1), y - 1) && this.hasSolider(addChar(a, -1), y - 1));
	}
	
	move_solider(a, b, a2, b2)
	{
		let solider = this.board[a + b];
		
		if(typeof(solider) === "undefined")
			return;
		
		this.remove_solider(a, b);
		this.create_solider(a2, b2, solider.color, solider.king);
		this.send("move;" + a + b + ";" + a2 + b2);
		
		this.flip_turn();
		
		if(solider.color && b2 == 8)
			this.send("king;" + a2 + b2);
		
		if(!solider.color && b2 == 1)
			this.send("king;" + a2 + b2);
	}
	
	eat(ab)
	{
		let solider = this.board[ab];
		
		if(typeof(solider) === "undefined")
			return;
		
		if(solider.color)
			--this.solider_count[0];
		else
			--this.solider_count[1];
		
		this.winner = this.getWinner();
		if(this.winner !== null)
		{
			console.log(this.winner);
			// Find the reason
			let reason = "defeat_soliders";
			
			this.game_over(reason);
		}
		
		delete this.board[ab];
		this.send("eat;" + ab);
	}
	
	/**
	 * Returns the winner of the match as a boolean value, true - white, false - black, null - game is not over
	 *
	 * @returns bool|null
	 */
	getWinner()
	{
		if(this.solider_count[0] <= 0)
			return false;
		
		if(this.solider_count[1] <= 0)
			return true;
		
		return null;
	}
	
	game_over(reason)
	{
		if(this.winner === null || this.ended)
			return;
		
		this.ended = true;
		clearInterval(this.timer_interval);
		this.send("game_over;" + this.winner + ";" + reason);
		
		delete games[this.id];
	}
	
	send(message)
	{
		for(var i in this.players)
		{
			this.players[i].sendUTF(message);
		}
	}
	
}