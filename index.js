const express = require('express');
var server = express();
var http = require('http').Server(server);
var io = require('socket.io')(http);

var Room = require("./server/room.js");
var rooms = {};

const port = process.env.PORT || 3711;
server.use(express.static(__dirname + "/public"));

server.get('/', (req, res) => {
    res.sendFile("html.html", {root: __dirname + "/public"});
});

io.on('connection', (s) => {
    console.log("new user");

    s.on("makeRoom", (data, callback) => {
        let num = "" + Math.ceil(Math.random()*10000 + 100);
        rooms[num] = Room(data.creatorName, s.id, num);
        s.join("room_" + num);
        callback(num, rooms[num].getSocialSnapshot());
    });

    s.on("joinRoom", (data, callback) => {
        if (rooms.hasOwnProperty(data.code)) {
            if (rooms[data.code].isWaitingForPlayers()) {
                s.join("room_" + data.code);
                rooms[data.code].addPlayer(data.name, s.id);
                s.broadcast.emit("playerJoined", data.name);
                callback(0, rooms[data.code].getSocialSnapshot());
            }
            // Game in Progress, Add Player as Spectator
            callback(1);
        } else {
            // Invalid Room Code
            callback(2);
        }
    });

    s.on("startGame", (data) => {
        let reaction = rooms[data.code].startGame();
        initGameData(data.code, reaction);		
    });

    s.on("socialAktion", (data) => {
        // Checking the action taken by a user and providing the respective reaction Event to whole Room
        let reaction;
        switch (data.type) {
            case "kickPlayer":
                reaction = rooms[data.code].kickPlayer(data.no);
                break;

            case "postMsg":
                reaction = rooms[data.code].postMsg(data.senderName, data.txt);
                break;
        }		
        reactToRoomSocial(data.code, reaction);
    });

    s.on("gameAktion", (data) => {
        // Checking the action taken by a user and providing the respective reaction Event to whole Room
        let reaction;
        switch (data.type) {
            case "playCard":
                reaction = rooms[data.code].playACard(data.cardNo, data.card, data.color);
                break;

            case "drawCard":
                reaction = rooms[data.code].drawACard();
                break;
        }		
        reactToRoomGame(data.code, reaction);
    });

    s.on('disconnect', () => {
        console.log("user left");
    });
		
});

function reactToRoomSocial(roomCode, reaction) {
    io.in("room_" + roomCode).emit("socialReaktionCommon", reaction.common);
    for (let id in reaction.unique) {
        io.to(id).emit("socialReaktionUnique", reaction.unique[id]);
    }
}

function reactToRoomGame(roomCode, reaction) {
    io.in("room_" + roomCode).emit("gameReaktionCommon", reaction.common);
    for (let id in reaction.unique) {
        io.to(id).emit("gameReaktionUnique", reaction.unique[id]);
    }
}

function initGameData(roomCode, reaction) {
    for (let i in reaction.playerIDs) {
        /*let d = {
            turn: reaction.gameSnap.turn,
            goingColor: reaction.gameSnap.goingColor,
            discardPile: reaction.gameSnap.discardPile,
            cardsList: reaction.gameSnap.playersCards[i]
        }*/
        let d = Object.assign({}, 
            reaction.gameSnap, 
            {cardsList: reaction.gameSnap.playersCards[i]}
        );
        delete d.playersCards;
        io.to(reaction.playerIDs[i]).emit("initGameData", d);
    }
}

/*function updateAllClients(roomCode) {
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

        // Distributing necessary data in room (unique) after the update
        let list = rooms[roomCode].playersList();
        for (let i = 0; i < list.length; i++) {
            io.to(list[i]).emit("uniqueGameUpdate", d.cardsList[i]);
        }
        io.to(rooms[roomCode].transferTurnTo()).emit("yourTurn");
    }
}*/

http.listen(port, () => {
    console.log("started");
});
