let SocialHandler = require("./socialHandler.js");
let GameHandler = require("./gameHandler.js");

let Room = (creatorName, creatorId, _code) => {

    let code = _code;
    let social = SocialHandler(creatorName, creatorId);
    let game = GameHandler();
    let state = "waiting";

    // ---------------------------------------- UTILITY FUNCS --------------------------------------------------

    function buildReactionFromChangeLog(changeLog) {
        let reaction = {common: [], unique: {}};
        changeLog.forEach((change) => {
            if (change.unique) {
                let pid = social.getPlayerID(change.applyTo);
                if (reaction.unique.hasOwnProperty(pid)) {
                    reaction.unique[pid].push(change);
                } else {
                    reaction.unique[pid] = change;
                }
                //reaction.unique[social.getPlayerID(change.applyTo)].push(change);
            } else {
                reaction.common.push(change);
            }
        });
        return reaction;
    }

    // ---------------------------------------- SOCIAL AKTIONS -------------------------------------------------

    let addPlayer = (_name, _id) => { social.addPlayer(_name, _id) }

    let kickPlayer = (n) => {
        let changeLog = social.kickPlayer(n);
        return buildReactionFromChangeLog(changeLog);
    }

    let postMsg = (senderName, txt) => { 
        let changeLog = social.postMsg(senderName, txt);
        return buildReactionFromChangeLog(changeLog);
    }

    let getSocialSnapshot = () => { return social.getSnapshot() }

    // ---------------------------------------- GAME AKTIONS ---------------------------------------------------

    let startGame = () => { 
        game.init(social.playerCount());
        state = "playing";
        return {gameSnap: game.getSnapshot(), playerIDs: social.getPlayerIDs()};
    }

    let playACard = () => { 
        let changeLog = game.playACard();
        return buildReactionFromChangeLog(changeLog);
    }

    let drawACard = () => { 
        let changeLog = game.drawACard();
        return buildReactionFromChangeLog(changeLog);
    }

    // --------------------------------------------------------------------------------------------------
    
    return {
        playersList: () => {
            let list = [];
            for (let i in players) {list.push(players[i].id)}
            return list;
        },
        getSocialSnapshot: getSocialSnapshot,
        startGame: startGame,
        addPlayer: addPlayer,
        playACard: playACard,
        drawACard: drawACard,
        postMsg: postMsg,
        kickPlayer: kickPlayer,
        isWaitingForPlayers: () => {if (state == "waiting") {return true} else {false}}
    }

};

module.exports = Room;
