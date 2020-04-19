let menu = "<div id='menu' class='screen'>\
	<img src='res/1b.png' id='c1' class='menu-cards'>\
	<img src='res/rr.png' id='c2' class='menu-cards'>\
	<img src='res/3g.png' id='c4' class='menu-cards'>\
	<img src='res/7y.png' id='c3' class='menu-cards'>\
	<img id='menu-deck' src='res/back.png'>\
	<input id='menu-txtbox' type='text' placeholder='Enter your name' maxlength='7'>\
	<button id='menu-createRoom-butt'>Make Room</button>\
	<button id='menu-joinRoom-butt'>Join Room</button>\
</div>"

let creatingRoom = "\
<div id='creating-game' class='screen application'>\
    <p id='txt'>Creating a Room for you</p>\
    <p id='code-txt'>Please Wait</p>\
    <button id='ok'>Okay</button>\
</div>"

let joiningRoom = "\
<div id='joining-game' class='screen application'>\
    <p id='txt'>Enter the room's code that you want to join</p>\
    <input type='text' maxlength='4' placeholder='room code' id='code-txt'></input>\
    <button id='ok'>Okay</button>\
</div>"

/*let Screener = () => {
	let screens = {};
	let activeScreen;

	let init = () => {
		let ids = document.getElementsByClassName("screen");
		let foo = ids.map((i) => {
			screens[i] = Screen(i);
		})
	}

	let display = (s) => {
		screens[s].introScreen();
		hide(activeScreen);
		activeScreen = s;
	}

	let hide = (s) => {
		screens[s].hideScreen();
	}

	let show = (s) => {
		screens[s].showScreen();
	}

	return {
		display: display,
		show: show,
		hide: hide
	}

}

let Screen = (id) => {

	let container = document.getElementById(id);
	let elems = {};

	for (let i = 0; i < container.children.length; i++) {
		elems["" + container.children[i].id] = container.children[i];
	}

	// Utility Funcs ---------------------------------------------------------------------

	let addClass = (id, name) => {
		classNam = elems[id].className.split(" ");
		classNam.push(name);
		elems[id].className = classNam;
	}

	let removeClass = (id, name) => {
		classNam = elems[id].className.split(" ");
		for (var i = 0; i < classNam.length; i++) {
			if (classNam[i] == name) {
				classNam.splice(i, 1);
			}
		}
		elems[id].className = classNam;
	}

	let switchClass = (id, initial, final) => {
		classNam = elems[id].className.split(" ");
		for (var i = 0; i < classNam.length; i++) {
			if (classNam[i] == initial) {
				classNam[i] = final;
			}
		}
		elems[id].className = classNam;
	}

	// Public Funcs ----------------------------------------------------------------------

	let animate = (id, animeName) => {
		let e;
		if (e == "container") {e = container} else {e = elems[id]};
		classNam = e.className.split(" ");
		for (var i = 0; i < classNam.length; i++) {
			if (classNam[i].split(0, 5) == "anime-") {
				classNam.splice(i, 1);
			}
		}
		classNam.push("anime-" + animeName);
		e.className = classNam;
	}

	let introScreen = () => {
		container.style.display = "block";
		animate("container", "intro");
		container.addEventListener("animationend", () => {
			container.removeEventListener("animationend");
			for (let i in elems) {
				elems[i].style.display = "block";
				animate(elems[i], "intro");
			} 
		});
	}

	let showScreen = () => {
		container.style.display = "block";
		for (let i in elems) {
			elems[i].style.display = "block";
		}
	}

	let showScreen = () => {
		container.style.display = "none";
		for (let i in elems) {
			elems[i].style.display = "block";
		}
	}

	let

	return {
		showScreen: showScreen,
		hideScreen: hideScreen,

	}
}*/
