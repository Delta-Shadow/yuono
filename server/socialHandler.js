module.exports = (_creatorName, _creatorId) => {;

    let creatorName = _creatorName;
    let creatorId = _creatorId;
    let players = [
        {name: creatorName, id: creatorId}
    ];
    let msgs = [
        // {sender, content}
    ];

    let addPlayer = (_name, _id) => {
        players.push(
            {name: _name, id: _id}
        );
    }

    let kickPlayer = (n) => {
        let changeLog = [];
        if (players.hasOwnProperty(n)) {players.splice(n)}
        changeLog.push( {desc: "kickPlayer", val: n, unique: false} );
        changeLog.push( {desc: "youHaveBeenKicked", applyTo: n, unique: true} );
        return changeLog;
    }

    let postMsg = (senderName, txt) => {
        let changeLog = [];
        if (msgs.length >= 20) { // Limit total msgs to 20 only
            msgs.splice(0, 1);
            changeLog.push( {desc: "removeOldestMsg", unique: false} );
        } 
        msgs.push({sender: senderName, content: txt});
        changeLog.push( {desc: "insertMsg", val: txt, sender: senderName, unique: false} );
        return changeLog;
    }

    let getSnapshot = () => {
        let d = {players: [], msgs: msgs}
        players.forEach(player => d.players.push(player.name));
        return d;
    }

    let getPlayerIDs = () => {
        let d = [];
        players.forEach(player => d.push(player.id));
        return d;
    }

    let getPlayerID = (n) => {
        return players[n].id;
    }

    return {
        addPlayer: addPlayer,
        kickPlayer: kickPlayer,
        postMsg: postMsg,
        playerCount: () => {return players.length},
        getPlayerIDs: getPlayerIDs,
        getPlayerID: getPlayerID,
        getSnapshot: getSnapshot
    }

}
