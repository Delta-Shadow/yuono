let sock = io();

let name = "DS";
let roomCode = "";
let creatorStatus = false;
let mode = "inMenu";
let isItMyTurn = false;

let socialData;
// socialData = { players: [], msgs: [] }
let gameData;
// gameData = {...}

GSM.registerMe("backend", (msg) => {
    switch (msg.topic) {
        case "setName":
            name = msg.val;
        break;

        case "makeRoom":
            makeRoom();
        break;

        case "joinRoom":
            joinRoom(msg.val);
        break;

        case "sendMsg":
            sendMsg(msg.val);
        break;
    }
});

//---------------------------------------- UTILITY FUNCS -------------------------------------------------------------

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

//----------------------------------- EVENTS THAT CLIENT CAN TRIGGER -------------------------------------------------

function makeRoom() {
    sock.emit("makeRoom", {creatorName: name}, (code, roomSnapshot) => {
        roomCode = code;
        creatorStatus = true;
        socialData = roomSnapshot;
        GSM.postMsg("frontend", {topic: "buildRoom", code: roomCode, data: socialData, isCreator: creatorStatus});
    });
};

function joinRoom(_c) {
    sock.emit("joinRoom", {name: name, code: _c}, (err, roomSnapshot) => {
        if (err == 0) {
            roomCode = _c;
            socialData = roomSnapshot;
            GSM.postMsg("frontend", {topic: "buildRoom", code: roomCode, data: socialData, isCreator: creatorStatus});
        } else if (err == 1) {
            GSM.postMsg("frontend", {topic: "roomIsBusy"});
        } else {
            GSM.postMsg("frontend", {topic: "codeIncorrect"});
        }
    });
}

function startGame() {
    if (creatorStatus && socialData.players.length > 1) {sock.emit("startGame", {code: roomCode})} else {alert("Invite more players to start a game!")};
}

//------------------------------------ LISTENING EVENTS FROM SERVER ---------------------------------------------------

sock.on("playerJoined", (playerName) => {
    //if (mode == "inRoom") {
        socialData.players.push(playerName);
        console.log(socialData.players);
    //}
});

sock.on("initGameData", (gameDeets) => {
    gameData = gameDeets;
    if (creatorStatus) {isItMyTurn = true};
    console.log(gameData);
});

//---------------------------------------- SOCIAL RELATED AKTIONS -------------------------------------------------------

function sendMsg(txt) {
    sock.emit("socialAktion", {type: "postMsg", code: roomCode, senderName: name, txt: txt});
};

function kickPlayer(n) {
    sock.emit("socialAktion", {type: "kickPlayer", code: roomCode, no: n});
};

//-------------------------------------- SOCIAL RELATED REAKTIONS -------------------------------------------------------

sock.on("socialReaktionCommon", (d) => {
    d.forEach((change) => {
        switch (change.desc) {
            case "kickPlayer":
                break;

            case "youHaveBeenKicked":
                break;
                
            case "insertMsg":
                GSM.postMsg("frontend", {topic: "insertMsg", sender: change.sender, txt: change.val});
                break;

            case "removeOldestMsg":
                break;
        }
    });
});

sock.on("socialReaktionUnique", (d) => {
    console.log(d);
});

//-------------------------------------- GAME RELATED AKTIONS ---------------------------------------------------------

function playCard(n) {
    if (!isItMyTurn) {alert("Its not your turn to play"); return 1}
    let cardName = gameData.cardsList[n];
    let cardCol;

    let playedCardDeets = getCardDeets(cardName);
    let discardedCardDeets = getCardDeets(gameData.discardPile[gameData.discardPile.length-1]);

    if (playedCardDeets.num == "w") {
        cardCol = prompt("Enter a Color");
    } else if (playedCardDeets.num == "d") {
        cardCol = prompt("Enter a Color");
    } else if (playedCardDeets.num == discardedCardDeets.num || playedCardDeets.color == discardedCardDeets.color) {
        cardCol = pcDeets.color;
    } else {
        console.log("this card can not be played");
        return 1;
    }

    // Ping Server
    sock.emit("gameAktion", {
        code: roomCode,
        type: "playCard",
        cardNo: n,
        card: cardName,
        color: cardCol
    });
}

function drawCard() {
    if (!isItMyTurn) {alert("Its not your turn to play"); return 1}
    sock.emit("gameAktion", {code: roomCode, type: "drawCard"});
}

//-------------------------------------- GAME RELATED REAKTIONS -------------------------------------------------------

sock.on("gameReaktionCommon", (d) => {
    console.log(d);
});

sock.on("gameReaktionUnique", (d) => {
    //isItMyTurn = (d.hasOwnProperty(isItMyTurn)) ? true : false;
    //if (d.hasOwnProperty(isItMyTurn)) {isItMyTurn = true} else {isItMyTurn = false}
    isItMyTurn = false;
    /*d.forEach((change) => {
    });*/
    console.log(d);
});

//------------------------------------- GRAPHICS RELATED DOM HANDLING -------------------------------------------------

function moveToRoom() {
    mode = "inRoom";
    // DOM handling goes here...
}

function moveToJoinRoomApplication() {
    mode = "moveToJoinRoomApplication";
    // DOM handling goes here...
}

function moveToMakeRoomApplication() {
    mode = "moveToMakeRoomApplication";
    // DOM handling goes here...
}

function moveToMenu() {
    mode = "inMenu";
    // DOM handling goes here...
}
