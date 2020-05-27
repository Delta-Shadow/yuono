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
            let ref = roomScreenDOM().getElementsByClassName("messages")[0];
            ref.insertAdjacentHTML("beforeend", screens.room.message(msg.txt, msg.sender));
            if (ref.getAttribute("data-scroll-dir") == "x") {
                ref.lastChild.style.left = ref.firstChild.getAttribute("data-pos") + "px";
            } else {
                ref.lastChild.style.top = ref.firstChild.getAttribute("data-pos") + "px";
            }
        break;
    }
});

document.body.innerHTML = screens.menu;

function menuScreenDOM() {return document.getElementById("menu")}
function formScreenDOM() {return document.getElementById("form")}
function roomScreenDOM() {return document.getElementById("room")}

//---------------------------------------------- SCROLLING ---------------------------------------------------------------

let anchorPos; let DOMpos; 
let scrollElem; let scrollDir = "o";
let bound;

function mouseDown(e) {
    e.preventDefault();
    scrollElem = e.target;
    while (!scrollElem.classList.contains("scrollable")) { scrollElem = scrollElem.parentElement }
    scrollDir = scrollElem.getAttribute("data-scroll-dir");
    if (scrollDir == "x") { anchorPos = (e.clientX || e.changedTouches[0].clientX) } else if (scrollDir == "y") { anchorPos = (e.clientY || e.changedTouches[0].clientY) };
    bound = getScrollingBounds(scrollElem, scrollDir, scrollElem.getAttribute("data-scroll-bound"));
    DOMpos = parseInt(scrollElem.getAttribute("data-pos") || "0");
} 

function getScrollingBounds(ele, scrollDir, boundingEdge) {
    let childs = ele.children;
    let containerSize = 0; let contentSize = 0;
    let lowerBound = 0; let upperBound = 0;
    if (scrollDir == "x") {
        containerSize = ele.clientWidth;
        for (let i = 0; i < childs.length; i++) {
            contentSize += getFullElemWidth(childs.item(i));
        }
    } else if (scrollDir == "y") {
        containerSize = ele.clientHeight;
        for (let i = 0; i < childs.length; i++) {
            contentSize += getFullElemHeight(childs.item(i));
        }
    }
    let delta = (contentSize > containerSize) ? (contentSize - containerSize) : 0;
    if (boundingEdge == "start") { lowerBound = -delta }
    if (boundingEdge == "end") { upperBound = delta }
    return ((pos) => {
        if (pos < lowerBound) {
            return lowerBound;
        } else if (pos > upperBound) {
            return upperBound;
        } else {
            return pos;
        }
    });
}

function getFullElemWidth(ele) {
    let s = window.getComputedStyle(ele);
    return (toFloat(s.width) + toFloat(s.paddingLeft) + toFloat(s.paddingRight) + toFloat(s.borderWidthLeft) + toFloat(s.borderWidthRight) + toFloat(s.marginLeft) + toFloat(s.marginRight));
}

function getFullElemHeight(ele) {
    let s = window.getComputedStyle(ele);
    return (toFloat(s.height) + toFloat(s.paddingTop) + toFloat(s.paddingBottom) + toFloat(s.borderWidthTop) + toFloat(s.borderWidthBottom) + toFloat(s.marginTop) + toFloat(s.marginBottom));
}

function toFloat(str) {
    return (parseFloat(str) || 0);
};

document.body.addEventListener("mousemove", moving);
document.body.addEventListener("touchmove", moving, {passive: false});

function moving(e) {
    e.preventDefault();
    if (scrollDir != "o") {
        let eles = scrollElem.children;
        if (scrollDir == "x") {
            let dist = (e.clientX || e.changedTouches[0].clientX) - anchorPos;
            let newDOMpos = (bound(DOMpos + dist)).toString();
            for (let i = 0; i < eles.length; i++) {
                eles.item(i).style.left = newDOMpos + "px";
                scrollElem.setAttribute("data-pos", newDOMpos);
            };
        } else if (scrollDir == "y") {
            let dist = (e.clientY || e.changedTouches[0].clientY) - anchorPos;
            let newDOMpos = (bound(DOMpos + dist)).toString();
            for (let i = 0; i < eles.length; i++) {
                eles.item(i).style.top = newDOMpos + "px";
                scrollElem.setAttribute("data-pos", newDOMpos);
            };
        }
    }
}

document.body.addEventListener("mouseup", () => { scrollDir = "o" });
document.body.addEventListener("touchend", () => { scrollDir = "o" }, {passive: false});

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
    ref.style.zIndex = "100";
    ref.className = "chatbox show";
}

function sendButtClicked() {
    let txt = roomScreenDOM().getElementsByClassName("txtbox")[0].value;
    GSM.postMsg("backend", {topic: "sendMsg", val: txt});
}

function backButtClicked() {
    let ref = roomScreenDOM().getElementsByClassName("chatbox")[0];
    let func = () => {
        ref.style.zIndex = "-100" 
        ref.removeEventListener("transitionend", func);
    }
    ref.addEventListener("transitionend", func);
    ref.className = "chatbox hide";
}

function quitButtClicked() {}

function kickButtClicked() {}
function startButtClicked() {}

//--------------------------------------------------------------------------------------------------------------------

function switchScreen(current, next) {
    return new Promise((resolve, reject) => {
        current.addEventListener("animationend", (e) => {
            if (e.target.className.split(" ")[0] != "screen") {return 0}
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
    let eles = ref.getElementsByClassName("scrollable");
    for (let i = 0; i < eles.length; i++) {
        eles.item(i).addEventListener("mousedown", mouseDown);
        eles.item(i).addEventListener("touchstart", mouseDown, {passive: false});
    };
}
