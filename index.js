const express = require('express');
var server = express();
var http = require('http').Server(server);
var io = require('socket.io')(http);
var gameHandler = require("./GameHandler.js");

const port = process.env.PORT || 3711;
server.use(express.static(__dirname + "/bin"));

var rooms = {};
var noOfRooms = 0;

server.get('/', (req, res) => {
	res.sendFile("html.html", {root: __dirname + "/bin"});
});

io.on('connection', (s) => {
	console.log("new user");

	s.on("makeRoom", (data, callback) => {
		var num = Math.ceil(Math.random()*10000 + 100);
		rooms["" + num] = gameHandler(data.creatorName, s.id, num);
		s.join("room_" + num);
		callback(num, rooms["" + num].getClientData());
	});

	s.on("joinRoom", (data, callback) => {
		if (rooms.hasOwnProperty(data.code)) {
			if (rooms["" + data.code].isWaitingForPlayers()) {
				s.join("room_" + data.code);
				rooms[data.code].addPlayer(data.name, s.id);
				s.broadcast.emit("waitingClientUpdate", rooms["" + data.code].getClientData());
				callback(0, rooms["" + data.code].getClientData());
			}
			callback(1);
		} else {
			callback(2);
		}
	});

	s.on("startGame", (data) => {
		rooms["" + data.code].initGame();
		rooms["" + data.code].setStateToWaiting(false);
		updateAllClients("" + data.code);		
	});

	s.on("updateRoom", (data, callback) => {
		// Checking the action taken by a user and updating the respective Game Handler accordingly
		switch (data.type) {
			case "cardPlayed":
				rooms["" + data.code].playACard(data.cardNo, data.card, data.color);
				break;

			case "cardDrawn":
				rooms["" + data.code].drawACard();
				break;

			case "msgPosted":
				break;

			/*case "playerKicked":
				rooms["" + data.code].kickPlayer();
				break;*/
		}		

		updateAllClients("" + data.code);
		let winner = rooms["" + data.code].checkIfWon();
		if (winner != -1) {
			io.in("room_" + data.code).emit("gameOver", winner);
			rooms["" + data.code].setStateToWaiting(true);
		}
	});

	s.on('disconnect', () => {
		console.log("user left");
	});
		
});

function updateAllClients(roomCode) {
	let d = rooms[roomCode].getClientData();
	io.in("room_" + roomCode).emit("clientUpdate", d);

	if (!rooms[roomCode].isWaitingForPlayers()) {
		d = rooms[roomCode].getGameData();
		// Distributing necessary data in room (common to all) after the update
		io.in("room_" + roomCode).emit("gameUpdate", {
			turn: d.turn,
			discardPile: d.discardPile,
			goingColor: d.currentColor,
			state: d.state
		});

		// Distributing necessary data in room (common to all) after the update
		let list = rooms[roomCode].playersList();
		for (let i = 0; i < list.length; i++) {
			io.to(list[i]).emit("uniqueGameUpdate", d.cardsList[i]);
		}
		io.to(rooms[roomCode].transferTurnTo()).emit("yourTurn");
	}
}

http.listen(port, () => {
	console.log("started");
});