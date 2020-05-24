GSM.registerMe("frontend", (msg) => {
    switch (msg.topic) {
        case "buildRoom":
            switchScreen(formScreenDOM(), screens.room.emptyRoom).then( (insertedEle) => {buildRoom(msg.code, msg.data, msg.isCreator,  insertedEle)} );
        break;

        case "roomIsBusy":
            alert("The Room you wish to join is in the middle of a game. Join them sometime later.");
        break;

        case "codeIncorrect":
            alert("The Room Code you provided is incorrect.");
        break;

        case "insertMsg":
            console.log(msg.sender, msg.txt);
            roomScreenDOM().getElementsByClassName("messages")[0].insertAdjacentHTML("beforeend", screens.room.message(msg.txt, msg.sender));
        break;
    }
});

document.body.innerHTML = screens.menu;

function menuScreenDOM() {return document.getElementById("menu")}
function formScreenDOM() {return document.getElementById("form")}
function roomScreenDOM() {return document.getElementById("room")}

//--------------------------------------------- CLICKIES !!! -------------------------------------------------------------

function playButtClicked() {
    let ref = menuScreenDOM();
    let str = ref.getElementsByClassName("txtbox")[0].value;
    //if (str == "") { alert("Please enter your name before playing. It's good manners."); return 0; }
    //GSM.postMsg("backend", {topic: "setName", val: str});
    GSM.postMsg("backend", {topic: "setName", val: "DS"});
    switchScreen(ref, screens.form);
}

function createRoomClicked() {
    GSM.postMsg("backend", {topic: "makeRoom"});
}

function joinRoomClicked() {
    let ref = formScreenDOM();
    let _c = ref.getElementsByClassName("txtbox")[0].value;
    if (_c == "") { alert("Please enter a room code. I need the code to add you in!"); return 0; }
    code = _c;
    GSM.postMsg("backend", {topic: "joinRoom", val: code});
}

function chatButtClicked() {
    let ref = roomScreenDOM().getElementsByClassName("chatbox")[0];
    ref.addEventListener("transitionend", () => { ref.style.zIndex = "100" });
    ref.className = "chatbox show";
}

function sendButtClicked() {
    let txt = roomScreenDOM().getElementsByClassName("txtbox")[0].value;
    GSM.postMsg("backend", {topic: "sendMsg", val: txt});
}

function backButtClicked() {
    let ref = roomScreenDOM().getElementsByClassName("chatbox")[0];
    ref.addEventListener("transitionend", () => { 
        console.log("hellow brother");
        ref.style.zIndex = "-100" 
    });
    ref.className = "chatbox hide";
}

function quitButtClicked() {}

function kickButtClicked() {}
function startButtClicked() {}

//--------------------------------------------------------------------------------------------------------------------

function switchScreen(current, next) {
    return new Promise((resolve, reject) => {
        current.addEventListener("animationend", () => {
            document.body.insertAdjacentHTML("beforeend", next);
            current.remove();
            resolve(document.body.lastChild);
        });
        current.className += " fadeOut"; 
    });
}

function buildRoom(code, data, isCreator) {
    let ref = roomScreenDOM();

    data.players.forEach((player) => {
        let ele = screens.room.player(player);
        ref.getElementsByClassName("players-list")[0].insertAdjacentHTML("beforeend", ele);
    });
    ref.insertAdjacentHTML("beforeend", screens.room.chatbox(code, isCreator));
}
