var server, color = null, board = {}, possible_moves = {}, current_move = null, my_turn = false, timer = null, timer_interval = null, force_moves = false, eatCheck = null, move_again = false, scores = [0, 0];
		
// Colors: true = white, false = black

function create_solider(a, b, solider_color = false, king = false)
{
	var center = document.createElement("center"), img = document.createElement("img");
	center.style.position = "relative";
	img.src = (solider_color ? "white.png" : "black.png");
	img.id = "img-" + a + b;
	img.style.width = "50px";
	img.style.height = "50px";
	img.draggable = (color === solider_color);
	center.appendChild(img);
	
	// Put a crown image on the king
	if(king)
	{
		img = document.createElement("img");
		img.src = "crown.png";
		img.id = "crown-" + a + b;
		img.style.position = "absolute";
		img.style.right = "7px";
		img.style.width = "50px";
		img.style.height = "50px";
		img.draggable = (color === solider_color);
		center.appendChild(img);
	}
		
	center.addEventListener("mousedown", () => {
		if(my_turn && !force_moves && solider_color === color)
			create_possible_moves(a, b);
	});
	
	board[a + b] = {color: solider_color, king: king};
	
	document.getElementById(a + b).appendChild(center);
}
		
function create_possible_move(a, b, solider_color = false, canEat = false, force = false)
{
	if(a.charCodeAt(0) < 97 || a.charCodeAt(0) > 104)
		return false;
				
	if(b < 1 || b > 8)
		return false;
				
	if(typeof(board[a + b]) !== "undefined")
	{
		if(!canEatSolider(current_move, a + b))
			return false;
					
		let num1 = a.charCodeAt(0) - current_move[0].charCodeAt(0), num2 = parseInt(b) - parseInt(current_move[1]);
		create_possible_move(addChar(a, num1), parseInt(b) + num2, color, a + b, force);
		return false;
	}
			
	if(eatCheck !== null)
	{
		if(canEat === false)
			return;
					
		eatCheck();
	}
				
	var center = document.createElement("center"), img = document.createElement("img");
	img.src = (solider_color ? "possible_move_white.png" : "possible_move_black.png");
	img.id = "img-" + a + b;
	img.style.width = "50px";
	img.style.height = "50px";
	img.draggable = false;
	img.addEventListener("click", (event) => {
		if(current_move === null)
			return;
					
		if(canEat !== false)
			server.send("eat;" + canEat);

		if(force === false)
			server.send("move;" + current_move + ";" + a + b);
		else
			server.send("move;" + force + ";" + a + b);
	});

	img.addEventListener("dragover", () => {
		event.preventDefault();
	});

	img.addEventListener("drop", (event) => {
		if(current_move === null)
			return;
					
		if(canEat !== false)
			server.send("eat;" + canEat);

		if(force === false)
			server.send("move;" + current_move + ";" + a + b);
		else
			server.send("move;" + force + ";" + a + b);
	});
	center.appendChild(img);
	let square = document.getElementById(a + b);
	possible_moves[a + b] = {color: solider_color, square: square, canEat: canEat};
	square.appendChild(center);
	return true;
}
		
function remove_possible_move(a, b)
{
	if(typeof(possible_moves[a + b]) === "undefined")
		return;
				
	document.getElementById(a + b).innerHTML = '';
}

function clear_possible_moves()
{
	for(var i in possible_moves)
	{
		possible_moves[i].square.innerHTML = '';
		delete possible_moves[i];
	}
}
		
function clear_board()
{
	for(var i in board)
	{
		document.getElementById(i).innerHTML = '';
		delete board[i];
	}
}
		
function exists(a, b)
{
	return typeof(board[a + b]) !== "undefined";
}
		
function create_possible_moves(a, b, force = false)
{
	if(typeof(board[a + b]) === "undefined")
		return;
				
	clear_possible_moves();
		
	current_move = a + b;
	let solider = board[a + b];
	if(solider.king)
	{
		var i;
		let y = parseInt(b);
				
		for(i = y + 1; i < 9; i++)
		{
			if(!create_possible_move(addChar(a, i - y), i, solider.color))
				break;
		}
				
		for(i = y + 1; i < 9; i++)
		{
			if(!create_possible_move(addChar(a, -(i - y)), i, solider.color))
				break;
		}
				
		for(i = y - 1; i > 0; i--)
		{
			if(!create_possible_move(addChar(a, y - i), i, solider.color))
				break;
		}
				
		for(i = y - 1; i > 0; i--)
		{
			if(!create_possible_move(addChar(a, -(y - i)), i, solider.color))
				break;
		}
	}else
	{
		// White
		if(solider.color)
		{
			let y = parseInt(b) + 1;
			create_possible_move(addChar(a, 1), y, true, false, force);
			create_possible_move(addChar(a, -1), y, true, false, force);
		}
		// Black
		else
		{
			let y = parseInt(b) - 1;
			create_possible_move(addChar(a, 1), y, false, false, force);
			create_possible_move(addChar(a, -1), y, false, false, force);
		}
	}
}
		
function canEatSolider(ab, ab2)
{
	if(typeof(board[ab2]) === "undefined" || typeof(board[ab]) === "undefined")
		return false;
				
	let a1 = ab[0], a2 = ab2[0], b1 = parseInt(ab[1]), b2 = parseInt(ab2[1]);
	return board[ab2].color !== board[ab].color && Math.abs(a1.charCodeAt(0) - a2.charCodeAt(0)) == 1 && Math.abs(b1 - b2) == 1;
}
		
function addChar(charac, add)
{
	if(charac === null || charac.length !== 1)
		return null;
				
	return String.fromCharCode(charac.charCodeAt(0) + add);
}
		
function remove_solider(a, b)
{
	document.getElementById(a + b).innerHTML = '';
	if(typeof(board[a + b]) !== "undefined")
		delete board[a + b];
}

function move_solider(a1, b1, a2, b2)
{
	let solider = board[a1 + b1];
	remove_solider(a1, b1);
	create_solider(a2, b2, solider.color, solider.king);
}

function update_timer()
{
	let timerElem = document.getElementById("timer");
	if(timer !== null && timerElem !== null)
	{
		let min = Math.floor(timer / 60), sec = timer % 60;

		if(min < 10)
			min = "0" + min;

		if(sec < 10)
			sec = "0" + sec;

		timerElem.innerHTML = min + ":" + sec;
	}
}
		
function update_scores()
{
	let scoreWhiteElem = document.getElementById("scoreWhite"), scoreBlackElem = document.getElementById("scoreBlack");
	scoreWhiteElem.innerHTML = scores[0];
	scoreBlackElem.innerHTML = scores[1];
}
		
function connect()
{
	let playButton = document.getElementById("playButton");
	playButton.disabled = true;
	playButton.className = "btn btn-secondary";
	playButton.innerHTML = "...מחפש שחקנים";

	server = new WebSocket("ws://localhost:8080", "echo-protocol");
			
	server.addEventListener('open', function (event) {
	});

	server.addEventListener('message', function (message) {
		var args = message.data.split(";");
		if(args[0] === "start")
		{
			color = (args[1] === "white");
					
			let colorElem = document.getElementById("yourColor");
			if(color)
			{
				colorElem.style.color = "#FFFFFF";
				colorElem.innerHTML = "!אתה הלבן";
			}else
			{
				colorElem.style.color = "#000000";
				colorElem.innerHTML = "!אתה השחור";
			}

			start();
			if(!color)
			{
				my_turn = true;
				let turnElem = document.getElementById("turn"), turnStatusElem = document.getElementById("turnStatus");
				turnElem.style.color = "#00FF00";
				turnStatusElem.innerHTML = "!תורך";
			}
		}else if(args[0] === "move")
		{
			let solider = board[args[1][0] + args[1][1]], chosen_move = possible_moves[args[2][0] + args[2][1]];
					
			clear_possible_moves();
					
			if(typeof(solider) === "undefined" || (solider.color === color && typeof(chosen_move) === "undefined"))
				return;
						
			move_solider(args[1][0], args[1][1], args[2][0], args[2][1]);
					
			if(solider.color === color && chosen_move.canEat !== false)
			{
				force_moves = false;
				// Check for chain eat
				let eatOptions = 0;
				eatCheck = () => {
					force_moves = true;
					++eatOptions;
				};
				create_possible_moves(args[2][0], args[2][1], args[2][0] + args[2][1]);
				eatCheck = null;
						
				console.log(eatOptions);
				if(eatOptions > 0)
				{
					server.send("move_again");
					move_again = true;
				}else
					clear_possible_moves();
			}
					
		}else if(args[0] === "eat")
		{
			let solider = board[args[1][0] + args[1][1]];
			
			if(typeof(solider) === "undefined")
				return;
			
			if(solider.color)
				--scores[0];
			else
				--scores[1];
			update_scores();
			
			remove_solider(args[1][0], args[1][1]);
		}else if(args[0] === "king")
		{
			let solider = board[args[1]];
			if(typeof(solider) === "undefined")
				return;
						
			remove_solider(args[1][0], args[1][1]);
			create_solider(args[1][0], args[1][1], solider.color, true);
		}else if(args[0] === "turn")
		{
			let turnElem = document.getElementById("turn"), turnStatusElem = document.getElementById("turnStatus");
			
			if(args[1] === "true")
			{
				my_turn = true;
				
				turnElem.style.color = "#00FF00";
				turnStatusElem.innerHTML = "!תורך";
			}else if(!move_again)
			{
				my_turn = false;
				clear_possible_moves();
				
				turnElem.style.color = "#FF0000";
				turnStatusElem.innerHTML = ".חכה לתורך";
			}else
			{
				move_again = false;
			}
		}else if(args[0] === "timer")
		{
			if(args[1] === "reset")
			{
				timer = 30;
				update_timer();
			}
		}else if(args[0] === "game_over")
		{
			clear_board();
			force_moves = true;
			clearInterval(timer_interval);
			
			let winnerDisplayElem = document.getElementById("winnerDisplay"), winnerColorElem = document.getElementById("winnerColor"), winnerReasonElem = document.getElementById("winnerReason");
			
			winnerDisplayElem.style.visibility = "visible";
			winnerDisplayElem.dir = "rtl";
			var color_str, opposite_color_str;
			if(args[1] === "true")
			{
				color_str = "לבן";
				opposite_color_str = "שחור";
				winnerDisplay.style.color = "#FFFFFF";
			}else
			{
				color_str = "שחור";
				opposite_color_str = "לבן";
				winnerDisplay.style.color = "#000000";
			}
			winnerColorElem.innerHTML = color_str + " ניצח!";
			
			switch(args[2])
			{
				case "quit":
					winnerReasonElem.innerHTML = opposite_color_str + " יצא מהמשחק!";
				break;
				case "defeat_soliders":
					winnerReasonElem.innerHTML = color_str + " הפיל את כל האויבים!";
				break;
			}
		}
	});	
			
}
		
function start()
{
	let playButton = document.getElementById("playButton");
	playButton.disabled = false;
	playButton.className = "btn btn-success";
	playButton.innerHTML = "!שחק";

	document.getElementById("startMenu").style.visibility = "hidden";
	document.getElementById("gameMenu").style.visibility = "visible";
		
	// Black
	create_solider("b", "8", false);
	create_solider("d", "8", false);
	create_solider("f", "8", false);
	create_solider("h", "8", false);
	create_solider("a", "7", false);
	create_solider("c", "7", false);
	create_solider("e", "7", false);
	create_solider("g", "7", false);
	create_solider("b", "6", false);
	create_solider("d", "6", false);
	create_solider("f", "6", false);
	create_solider("h", "6", false);
			
	// White
	create_solider("a", "1", true);
	create_solider("c", "1", true);
	create_solider("e", "1", true);
	create_solider("g", "1", true);
	create_solider("b", "2", true);
	create_solider("d", "2", true);
	create_solider("f", "2", true);
	create_solider("h", "2", true);
	create_solider("a", "3", true);
	create_solider("c", "3", true);
	create_solider("e", "3", true);
	create_solider("g", "3", true);

	timer = 30;
	update_timer();
	timer_interval = setInterval(() => {
		timer--;
		update_timer();
	}, 1000);
	
	scores = [12, 12];
	update_scores();
}