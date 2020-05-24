module.exports = () => {

    let turn = 0;
    let turnDirection = 2;
    let playerCount = 0;
    let playersCards = [];
    let drawPile = [];
    let discardPile = [];
    let goingColor = "";

    // ----------------------------------------- GAME LOGIC ---------------------------------------------------------

    let initDeck = (numberOfPlayers) => {
        drawPile = [];
        let noOfDecks = 1;
        if (numberOfPlayers > 4) {noOfDecks = 2}; // If there are more than 4 players, use 2 decks, increasing the deck size to 104 cards
        for (let k = 0; k < noOfDecks; k++) {
            for (let i = 0; i < 4; i++) {
                let colos = ['r', 'g', 'b', 'y'];
                let acts = ['r', 's'];
                for (let j = 0; j < 10; j++) {
                    drawPile.push("" + j + colos[i]);
                }
                drawPile.push(colos[i] + "r");
                drawPile.push(colos[i] + "s");
                drawPile.push(colos[i] + "d");
            }
            drawPile.push("_d"); drawPile.push("_d"); drawPile.push("_w"); drawPile.push("_w");
        }
    }

    let initPlayers = (numberOfPlayers) => {
        playersCards = [];
        for (let i = 0; i < numberOfPlayers; i++) {
            let cards = [];
            for (let j = 0; j < 7; j++) {
                cards.push(getCardFromDeck());
            }
            playersCards.push(cards);
        }
    }

    let getCardFromDeck = () => {
        let num = Math.floor(Math.random()*100) % (drawPile.length - 1);
        return drawPile.splice(num, 1)[0];
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

    let incrementTurn = () => {
        if (turnDirection % 2 == 0) {
            turn++;
            if (turn > playerCount - 1) {turn = 0};
        } else {
            turn--;
            if (turn < 0) {turn = playerCount - 1};
        }
    }

    let virtualIncrementTurn = () => {
        let _turn = turn;
        if (turnDirection % 2 == 0) {
            _turn++;
            if (_turn > playerCount - 1) {_turn = 0};
        } else {
            _turn--;
            if (_turn < 0) {_turn = playerCount - 1};
        }
        return _turn;
    }

    let giveCardsToNextPlayer = (n) => {
        let _changeLog = [];
        for (let i = 0; i < n; i++) {
            let drawnCard = getCardFromDeck();
            let t = virtualIncrementTurn();
            playersCards[t].push(drawnCard);
            _changeLog.push( {desc: "insertCardInHand", val: drawnCard, applyTo: t, unique: true} );
        }
        return _changeLog;
    };

    // ----------------------------------- ACTIONS THAT PLAYERS CAN TAKE ----------------------------------------
    
    let drawACard = () => {
        // Draw card from deck into hand
        let drawnCard = getCardFromDeck();
        let changeLog = [];
        playersCards[turn].push(drawnCard);
        changeLog.push( {desc: "changeCardCount", val: playersCards[turn].length, applyTo: turn, unique: false} );
        changeLog.push( {desc: "insertCardInHand", val: drawnCard, applyTo: turn, unique: true} );
        incrementTurn();
        changeLog.push( {desc: "changeTurn", val: turn, unique: false} );
        changeLog.push( {desc: "itsYourTurn", applyTo: turn, unique: true} );
        return changeLog;
    }

    let playACard = (cardNo, card, color) => {
        let changeLog = [];

        // Throw selected card in pile
        playersCards[turn].splice(cardNo, 1);
        let playedCard = playersCards[turn].splice(cardNo, 1)[0];
        discardPile.push(playedCard);
        changeLog.push( {desc: "insertCardInDiscardPile", val: playedCard, unique: false} );
        goingColor = color;
        changeLog.push( {desc: "changeGoingColor", val: goingColor} );

        // If the Discard Pile is overloaded, put it back into deck
        if (discardPile.length > drawPile.length) {
            drawPile.concat(discardPile);
            discardPile.splice(0, discardPile.length - 3);
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
                changeLog.concat( giveCardsToNextPlayer(2) );
                break;

            case ("_w" || "_w"):
                // Nothing special really. Makes this card seem useless, doesn't it?
                break;

            case ("_d" || "_d"):
                changeLog.concat( giveCardsToNextPlayer(2) );
                break;

        }
        incrementTurn();
        changeLog.push( {desc: "changeTurn", val: turn, unique: false} );
        changeLog.push( {desc: "itsYourTurn", applyTo: turn, unique: true} );
    }

    // ---------------------------------------------------------------------------------------------------

    let init = (numberOfPlayers) => {
        initDeck(numberOfPlayers);
        initPlayers(numberOfPlayers);
        discardPile = [];
        discardPile.push(getCardFromDeck());
        goingColor = getCardColor(discardPile[discardPile.length-1]);
        playerCount = numberOfPlayers;
    }

    let getSnapshot = () => {
        return {
            turn: turn,
            goingColor: goingColor,
            discardPile: discardPile,
            playersCards: playersCards
        };
    }

    return {
        init: init,
        playACard: playACard,
        drawACard: drawACard,
        getSnapshot: getSnapshot
    }

}
