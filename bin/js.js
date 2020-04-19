//let sock = io();

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
let winnerName = "";

let screens = (() => {
	let _screenContainers = document.getElementsByClassName("screen");
	let _screens = {};
	for (let i = 0; i < _screenContainers.length; i++) {
		let screenContainer = _screenContainers.item(i);
		_screens[screenContainer.id] = {container: screenContainer} 
		_screens[screenContainer.id]["elems"] = screenContainer.children;
	}
	return _screens;
})();

// -------------------------------- INPUTS FROM HTML ------------------------------------------

function createRoom() {
	display("createdRoom", () => {
		hide("menu");
	});
}

function joinRoomPrompt() {
	display("joinRoomPrompt", () => {
		//hide("menu")
	});
}

function sendJoinRequest() {
	let _code = screens.joiningRoom.elems.namedItem("code-prompt-txtbox").value;
	sock.emit("joinRoom", {name: playerName, code: _code}, (success, roomDeets) => {
		if (success == 0) {
			roomCode = _code;
			players = roomDeets.players;
			console.log("Joined Room: " + _code);
			console.log(players);
		} else if (success == 1) {
			console.log("a game is in progress. pls try again later.");
			moveToWaitingRoom();
		} else {
			console.log("the passcode you entered is incorrect.");
			undisplay("joinRoomPrompt");
		}
	});
}

function moveToWaitingRoom() {
	displayGameRoom();
}

function startGame() {
	if (players.length > 1 && creatorStatus) { 
		sock.emit("startGame", {code: roomCode}); 
	} else {
		return 1;
	};
}

function playCard() {
	// body...
}

// ------------------------------- GRAPHICS FUNCS -----------------------------------------------

let animate = (e, animeName) => {
	classNam = e.className.split(" ");
	for (var i = 0; i < classNam.length; i++) {
		if (classNam[i].split(0, 5) == "anime-") {
			classNam.splice(i, 1);
			break;
		}
	}
	classNam.push("anime-" + animeName);
	e.className = classNam;
}

function display(screenName, callback) {
	let screen = screens[screenName];
	screen.container.style.display = "block";
	animate(screen.container, "intro");
	container.addEventListener("animationend", () => {
		container.removeEventListener("animationend");
		for (let i = 0; i < screen.elems.length; i++) {
			screen.elems.item(i).style.display = "block";
			animate(screen.elems.item(i), "intro");
			callback();
		} 
	});
}

function undisplay(screenName, callback) {
	let screen = screens[screenName];
	for (let i = 0; i < screen.elems.length; i++) {
		animate(screen.elems.item(i), "outro");
	}
	animate(screen.container, "outro");
	container.addEventListener("animationend", () => {
		container.removeEventListener("animationend");
		callback();
	});
}

function hide(screenName) {
	screen[screenName].container.style.display = "none";
}

// -------------------------------- GAME STUFF -------------------------------------------------

function displayGameRoom() {
	display("gameRoom");
	if (roomState == "waiting" && winnerName == "") { // First Game. No Winner.
		let codeTextCard = screen.gameRoom.children.namedItem("code-txtcard");
		codeTextCard.display = "block";
		animate(codeTextCard, "intro");

	} else if (roomState == "playing") { // Playing.

	} else { // waiting AFTER atleast one game. Yes Winner.

	}
}