//let sock = io();

let playerName = null;
let roomCode;
let players = [];
let roomState = "";
let creatorStatus = false;
let isItMyTurn = false;
let goingColor;
let cards = [];
let discardPile = [];
let turn = 0;
let winnerName = "";
let emptyRoomDeets;

let menuCont = document.getElementById('menu-cont');
let creatingRoomCont = document.getElementById('creating-room-cont');
let joiningRoomCont = document.getElementById('joining-room-cont');
let gameRoomCont = document.getElementById('game-room-cont');

menuCont.style.zIndex = "37";
menuCont.innerHTML = screens.menu;

// -------------------------------- INPUTS FROM HTML ------------------------------------------

function createRoom() {
    playerName = document.getElementById("menu-txtbox").value;
    if (playerName == "") {
        alert("Please Enter your name"); 
    } else {
        menuCont.style.zIndex = "0";
        creatingRoomCont.style.zIndex = "37";
        creatingRoomCont.innerHTML = screens.creatingRoom;

        sock.emit("makeRoom", {creatorName: playerName}, (pass, roomDeets) => {
            roomCode = pass;
            creatorStatus = true;
            emptyRoomDeets = roomDeets;
            let temp = creatingRoomCont.children[0];
            temp.getElementsByClassName("txt")[0].innerText = "Your friends can join this room using this code";
            temp.getElementsByClassName("code-txt")[0].innerText = roomCode;
            temp.getElementsByClassName("ok")[0].style.opacity = "1";
        });
    }
}

function joinRoomPrompt() {
    playerName = document.getElementById("menu-txtbox").value;
    if (playerName == "") {
        alert("Please Enter your name"); 
    } else {
        menuCont.style.zIndex = "0";
        joiningRoomCont.style.zIndex = "37";
        joiningRoomCont.innerHTML = screens.joiningRoom;
    }
};

function reqToJoinRoom() {
    _c = joiningRoomCont.children[0].getElementsByClassName("code-txt")[0].value;
    if (_c == "") {
        alert("Please Enter a code"); 
    } else {
        sock.emit("joinRoom", {name: playerName, code: _c}, (err, roomDeets) => {
            if (err == 0) {
                roomCode = _c;
                moveToGameRoom();
                basicRoomUpdate(roomDeets);
            } else if (err == 1) {
                alert("The room you requested to join is in the middle of a game. Try again later.");
            } else {
                alert("The room code you provided is incorrect.");
            }
        });
    }
}

function moveToEmptyGameRoom() {
    moveToGameRoom();
    basicRoomUpdate(emptyRoomDeets);
}

function moveToGameRoom() {
    creatingRoomCont.style.zIndex = "0";
    joiningRoomCont.style.zIndex = "0";
    gameRoomCont.style.zIndex = "37";
    gameRoomCont.innerHTML = screens.gameRoom;
    gameRoomCont.children[0].addEventListener("animationend", () => {
        menuCont.innerHTML = ""; creatingRoomCont.innerHTML = ""; joiningRoomCont.innerHTML = "";
    });
};

function goBackToMenu() {
    let temp = joiningRoomCont.children[0];
    temp.addEventListener("animationend", () => {
        joiningRoomCont.style.zIndex = "0";
        menuCont.style.zIndex = "37";
        joiningRoomCont.innerHTML = "";
    });
    temp.style.animation = "fadeOut 1s";
}

function startGame() {
    if (players.length > 1 && creatorStatus) { 
        sock.emit("startGame", {code: roomCode}); 
    } else {
        return 1;
    };
}

// ------------------------------ SERVER SIDE STUFF ---------------------------------------------

sock.on("clientUpdate", basicRoomUpdate);
sock.on("gameUpdate", gameUpdate);
sock.on("uniqueGameUpdate", uniqueGameUpdate);
sock.on("yourTurn", () => {
    isItMyTurn = true;
});

// ----------------------------------- GAME LOGIC -----------------------------------------------

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

function basicRoomUpdate(d) {
    if (d.state != roomState) { // State has been changed, hide/show the pre-game Content
       let preGameContent = gameRoomCont.children[0].getElementsByClassName("pregame-content");
       if (d.state == "waiting") {
           preGameContent[0].style.opacity = "1"; preGameContent[1].style.opacity = "1"; 
           if (creatorStatus) {preGameContent[2].style.opacity = "1"}
       } else {
           preGameContent[0].style.opacity = "0"; preGameContent[1].style.opacity = "0"; preGameContent[2].style.opacity = "0";
       }
    }
    roomState = d.state;
    let playersListDOM = document.getElementById("players-list");
    for (let i in d.players) {
        if (!players.hasOwnProperty(i)) { // this player doesn't exist yet. create him.
            playersListDOM.insertAdjacentHTML("beforeend", screens.playerIcon);
            playersListDOM.children[i].children.namedItem("name").innerText = d.players[i].name;
            playersListDOM.children[i].children.namedItem("avatar-txt").innerText = d.players[i].name.slice(0, 1).toUpperCase();
            players.push({name: d.players[i].name, cardCount: d.players[i].cardCount});
        } else if (players[i].cardCount != d.players[i].cardCount) { // this players has lost/gained cards.
            playersListDOM.children[i].children.namedItem("card-count").innerText = d.players[i].cardCount;
            players[i].cardCount = d.players[i].cardCount;
        }
    }
}

function gameUpdate(d) {
    // Updating the Discard Pile
    let discardPileDOM = document.getElementById("discard-pile");
    if (d.discardPile.length > 1) { // move already present cards in the discard pile
        for (let i = 0; i < discardPileDOM.children.length; i++) {
            discardPileDOM.children[i].className = "c" + (i+2);
        }
    } 
    discardPileDOM.insertAdjacentHTML("afterbegin", screens.discardedCard);
    discardPileDOM.getElementsByClassName("c1")[0].src = "res/" + d.discardPile[0] + ".png";
    discardPile = d.discardPile;

    // Updating the turn
    let playersListDOM = document.getElementById("players-list");
    playersListDOM.children[turn].children.namedItem("name").style.backgroundColor = "transparent";
    playersListDOM.children[d.turn].children.namedItem("name").style.backgroundColor = "red";
    turn = d.turn;

    goingColor = d.goingColor;
}

function uniqueGameUpdate(d) { // Update Hand Cards
    let cardsDOM = document.getElementById("cards-list");
    for (let i in d) {
        if (!cards.hasOwnProperty(i)) { // this card doesn't exist yet. create it.
            cardsDOM.insertAdjacentHTML("beforeend", screens.card);
            cardsDOM.children[i].src = "res/" + d[i] + ".png";
            cardsDOM.children[i].name = d[i];
            cards.push(d[i]);
        } 
    }
}

let playThisCard = (e) => {
    _c = e.name;
    if (!isItMyTurn) {alert("Its not your turn to play"); return 1}
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
    // Animate some stuff
    e.addEventListener("transitionend", () => {
        console.log("nyeah");
        e.remove();
    });
    e.className = "removing";

    // Ping Server
    sock.emit("updateRoom", {
        code: roomCode,
        type: "cardPlayed",
        cardNo: Array.prototype.indexOf.call(e.parentNode.children, e),
        card: _c,
        color: c
    });
}
