let screens = (() => {

    let menu = "\
        <div id='menu' class='screen'>\
            <img src='res/1b.png' class='c1 card'>\
            <img src='res/rr.png' class='c2 card'>\
            <img src='res/3g.png' class='c4 card'>\
            <img src='res/7y.png' class='c3 card'>\
            <img class='deck' src='res/back.png'>\
            <input class='txtbox' type='text' placeholder='Enter your name' maxlength='7'>\
            <button class='play butt' onclick='playButtClicked()'>Play</button>\
        </div>\
    "

    let form = "\
        <div id='form' class='screen'>\
            <p class='txt'>Make a game room and invite friends to play</p>\
            <button class='makeRoom butt' onclick='createRoomClicked()'>Create Room</button>\
            <p class='txt'>Or join a room using a code, if you have one</p>\
            <input class='txtbox' type='text' maxlength='4' placeholder='Enter Room Code'></input>\
            <button class='joinRoom butt' onclick='joinRoomClicked()'>Join Room</button>\
        </div>\
    "

    let room = {
        chatbox: (code, isCreator) => {
            let HTMLstrStart = ""
                +"<div class='chatbox show'>"
                    +"<div class='room-code'>Room Code: " + code + "</div>"
                    +"<div class='messages'></div>"
                    +"<input class='txtbox' type='text'</input>"
                    +"<button class='send butt' onclick='sendButtClicked()'>Send</button>"
                    +"<button class='quit butt' onclick='quitButtClicked()'>Quit</button>"
                    +"<button class='back butt' onclick='backButtClicked()'>Back</button>";

            let creatorOnlyHTMLstr = ""
                    +"<button class='kick butt creator-only' onclick='kickButtClicked()'>Kick</button>"
                    +"<button class='start butt creator-only' onclick='startButtClicked()'>Start</button>";

            let HTMLstrEnd = ""
                    +"</div>"
                +"</div>";

            let HTMLstr = HTMLstrStart + (isCreator ? creatorOnlyHTMLstr : "") + HTMLstrEnd;
            return HTMLstr;
        },

        message: (txt, sender) => {
            return ("<div class='message'>"
                        +"<p class='sender'>" + sender + "</p>"
                        +"<p class='txt'>" + txt + "</p>"
                    +"</div>");
        },

        player: (name) => {
            let initials = name.charAt(0).toUpperCase();
            return ("<div class='player'>"
                        +"<p class='name'>" + name + "</p>"
                        +"<div class='avatar'>"
                            +"<img src='res/player-icon.png'>"
                            +"<p class='initials'>" + initials + "</p>"
                        +"</div>"
                        +"<p class='card-count'>-</p>"
                    +"</div>");
        },

        discardedCard: (c) => {
            return ("<img class='c1' src='res/placeholder.png'>");
        },

        card: (c) => {
            return ("<img src='res/placeholder.png' class='card'>");
        },

        emptyRoom: "\
            <div id='room' class='screen'>\
                <div class='players-list'></div>\
                <img class='draw-pile' src='res/back.png'>\
                <div class='discard-pile'>\
                    <img class='c1' src='res/placeholder.png'>\
                    <img class='c2' src='res/placeholder.png'>\
                    <img class='c3' src='res/placeholder.png'>\
                </div>\
                <img class='chat butt' src='res/icon-chat.png' onclick='chatButtClicked()'>\
                <div class='cards-list'>\
                    <img src='res/placeholder.png' class='card initial-card'>\
                    <img src='res/placeholder.png' class='card initial-card'>\
                    <img src='res/placeholder.png' class='card initial-card'>\
                    <img src='res/placeholder.png' class='card initial-card'>\
                    <img src='res/placeholder.png' class='card initial-card'>\
                    <img src='res/placeholder.png' class='card initial-card'>\
                    <img src='res/placeholder.png' class='card initial-card'>\
                </div>\
            </div>"
    }

    return {
        menu: menu,
        form: form,
        room: room
    }

})();
