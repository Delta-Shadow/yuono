let GameHandler = (creatorName, _id, _code) => {

	let code = _code;
	let playerCount = 1;
	let players = [{id: _id, name: creatorName, cards: []}];
	let deck = [];
	let pile = [];
	let turn = 0;
	let turnDirection = 2;
	let goingColor = "";
	let state = "waiting"

	let getCardFromDeck = () => {
		let num = Math.floor(Math.random()*100) % (deck.length - 1);
		deck.splice(num, 1);
		return deck[num];
	}

	let initPlayers = () => {
		for (let i = 0; i < playerCount; i++) {
			players[i].cards = [];
			for (let j = 0; j < 7; j++) {
				players[i].cards.push(getCardFromDeck());
			}
		}
	}

	let initDeck = () => {
		deck = [];
		let noOfDecks = 1;
		if (playerCount > 4) {noOfDecks = 2}; // If there are more than 4 players, use 2 decks, increasing the deck ize to 104 cards
		for (let k = 0; k < noOfDecks; k++) {
			for (let i = 0; i < 4; i++) {
				let colos = ['r', 'g', 'b', 'y'];
				let acts = ['r', 's'];
				for (let j = 0; j < 10; j++) {
					deck.push("" + j + colos[i]);
				}
				deck.push(colos[i] + "r");
				deck.push(colos[i] + "s");
				deck.push(colos[i] + "d");
			}
			deck.push("_d"); deck.push("_d"); deck.push("_w"); deck.push("_w");
		}
	}

	let getCardColor = (c) => {
		let cool;
		if (c.charCodeAt(0) >= 48 && c.charCodeAt(0) <= 57) { // 1st char is a number, 2nd char will give color
			cool = c.slice(1, 2);
		} else if (c.charCodeAt(0) == 95) { // 1st char is '_', it is a black card. Set default color Red
			cool = "r";
		} else { // it is an action card. 1st char gives color
			cool = c.slice(0, 1);
		}
		return cool;
	}

	let addPlayer = (_name, _id) => {
		playerCount++;
		players.push({id: _id, name: _name, cards: []});
	}

	let kickPlayer = () => {}

	let playACard = (cardNo, card, color) => {
		// Throw selected card in pile
		pile.push(players[turn].cards[cardNo]);
		players[turn].cards.splice(cardNo, 1);
		goingColor = color;

		// If the Discard Pile is overloaded, put it back into deck
		if (pile.length > deck.length) {
			deck.concat(pile);
			pile.splice(0, pile.length - 3);
		};

		// Apply After Effects for Action Cards
		switch (card) {
			case ("rs" || "bs" || "ys" || "gs"):
				incrementTurn();
				break;

			case ("rr" || "br" || "yr" || "gr"):
				turnDirection++;
				break;

			case ("rd" || "bd" || "yd" || "gd"):
				players[virtualIncrementTurn()].cardsList.push(getCardFromDeck());
				players[virtualIncrementTurn()].cardsList.push(getCardFromDeck());		
				break;

			case ("_w" || "_w"):
				// Nothing special really. Makes this card seem useless, doesn't it?
				break;

			case ("_d" || "_d"):
				players[virtualIncrementTurn()].cardsList.push(getCardFromDeck());
				players[virtualIncrementTurn()].cardsList.push(getCardFromDeck());
				players[virtualIncrementTurn()].cardsList.push(getCardFromDeck());
				players[virtualIncrementTurn()].cardsList.push(getCardFromDeck());
				break;

		}
		incrementTurn();
	}

	let drawACard = () => {
		// Draw card from deck into hand
		players[turn].cardsList.push(getCardFromDeck());
		incrementTurn();
	}

	let transferTurnTo = () => {
		return players[turn].id;
	}

	let getNameOfCurrentPlayer = () => {
		return players[turn].name;
	}

	let incrementTurn = () => {
		if (turnDirection % 2 == 0) {
			turn++;
			if (turn > playerCount - 1) {turn = 1};
		} else {
			turn--;
			if (turn < 0) {turn = playerCount - 1};
		}
	}

	let virtualIncrementTurn = () => {
		let _turn = turn;
		if (turnDirection % 2 == 0) {
			_turn++;
			if (_turn > playerCount - 1) {_turn = 1};
		} else {
			_turn--;
			if (_turn < 0) {_turn = playerCount - 1};
		}
		return _turn;
	}

	let initGame = () => {
		initDeck();
		initPlayers();
		pile.push(getCardFromDeck());
		goingColor = getCardColor(pile[pile.length-1]);
	}

	let getClientData = () => {
		let d = {players: []};
		for (let i = 0; i < playerCount; i++) {
			d.players.push({name: players[i].name, cardCount: players[i].cards.length});
		}
		return d;
	}

	let getGameData = () => {
		let d = {
			discardPile: [],
			turn: turn,
			cards: [],
			currentColor: goingColor,
			state: "playing"
		}
		for (let i = 0; i < playerCount; i++) {
			d.cardsList.push(players[i].cards);
		}
		for (var i = 1; i <= pile.length && i <= 3; i++) {
			d.discardPile.push(pile[pile.length - i]);
		}
		return d;
	}

	let checkIfWon = () => {
		for (let i in players) {
			if (players[i].cards == 0) {return players[i].name};
		}
		return -1;
	}

	return {
		playersList: () => {
			let list = [];
			for (let i in players) {list.push(players[i].id)}
			return list;
		},
		addPlayer: addPlayer,
		initGame: initGame,
		playACard: playACard,
		drawACard: drawACard,
		transferTurnTo: transferTurnTo,
		getClientData: getClientData,
		getGameData: getGameData,
		isWaitingForPlayers: () => {if (state == "waiting") {return true} else {false}},
		setStateToWaiting: (val) => {if (val) {state = "waiting"} else {state = "playing"}},
		checkIfWon: checkIfWon
	}

};

module.exports = GameHandler;