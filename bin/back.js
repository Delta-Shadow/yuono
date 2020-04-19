let back = (() => {

	let sock = io();

	let playerName;
	let roomCode;
	let players;
	let roomState;
	let creatorStatus = false;
	let isItMyTurn = false;
	let goingColor;
	let cards;
	let discardPile;
	let turnersName;

	let getCardDeets = (c) => {
		let colo;
		let _num;
		if (c.charCodeAt(0) >= 48 && c.charCodeAt(0) <= 57) { // 1st char is a number, 2nd char will give color. Basic Card.
			_num = c.slice(0, 1);
			colo = c.slice(1, 2);
		} else if (c.charCodeAt(0) == 95) { // 1st char is '_', it is a black card. 
			_num = c.slice(1, 2);
			colo = "black";
		} else { // it is an action card. 1st char gives color
			_num = c.slice(1, 2);
			colo = c.slice(0, 1);
		}
		return {color: colo, num: _num};
	}

	let playACard = (cSerial) => {
		if (!isItMyTurn) {console.log("not ur turn"); return 1}
		let _c = cards[cSerial];
		let pcDeets = getCardDeets(_c);
		let dcDeets = getCardDeets(discardPile[discardPile.length-1]);
		let c;
		if (pcDeets.num == "w") {
			c = prompt("Enter a Color");
		} else if (pcDeets.num == "d") {
			c = prompt("Enter a Color");
		} else if (pcDeets.num == dcDeets.num || pcDeets.color == dcDeets.color) {
			c = pcDeets.color;
		} else {
			console.log("this card can not be played");
			return 1;
		}
		sock.emit("updateRoom", {
			code: roomCode,
			type: "cardPlayed",
			cardNo: cSerial,
			card: _c,
			color: c
		});
	}

	let createRoom = () => {
		sock.emit("makeRoom", {creatorName: playerName}, (pass, roomDeets) => {
			roomCode = pass;
			roomState = roomDeets.state;
			players = roomDeets.players;
			creatorStatus = true;
			console.log("Made Room: " + pass);
			console.log(players);
		});
	}

	let joinRoom = (_code) => {
		sock.emit("joinRoom", {name: playerName, code: _code}, (success, roomDeets) => {
			if (success == 0) {
				roomCode = _code;
				players = roomDeets.players;
				console.log("Joined Room: " + _code);
				console.log(players);
			} else if (success == 1) {
				console.log("a game is in progress. pls try again later.");
			} else {
				console.log("the passcode you entered is incorrect.")
			}
		});
	}

	let startGame = () => {
		if (players.length > 1 && creatorStatus) { 
			sock.emit("startGame", {code: roomCode}); 
		} else {
			return 1;
		};
	}

	sock.on("waitingClientUpdate", (d) => {
		players = d.players;
		roomState = d.state;
		console.log(players);
	});

	sock.on("clientUpdate", (d) => {
		players = d.players;
		turnersName = players[d.turn].name;
		discardPile = d.discardPile;
		goingColor = d.goingColor;
		roomState = d.state;
		console.log(d);
		console.log("It is the turn of " + turnersName);
	});

	sock.on("uniqueClientUpdate", (d) => {
		cards = d;
		console.log(d);
	});

	sock.on("yourTurn", () => {
		isItMyTurn = true;
	});

	sock.on

	return {
		setPlayerName: (n) => {playerName = n},
		getPlayerName: () => {return playerName},
		createRoom: createRoom,
		joinRoom: joinRoom,
		startGame: startGame,
		play: playACard
	}

})();