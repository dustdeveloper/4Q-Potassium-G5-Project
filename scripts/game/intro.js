var intro_timeline = gsap.timeline();

var complete_signal = new Signal();
var intro_complete = false;

var skip_all = true;

function add_to(text, side) {
    let new_paragraph = document.createElement("p");
    new_paragraph.textContent = text;

    let target = side === "left" 
        ? document.getElementById("left-intro-indicator") 
        : document.getElementById("right-intro-indicator");
    target.appendChild(new_paragraph);
}

function clear() {
    let left_indicator = document.getElementById("left-intro-indicator");
    let right_indicator = document.getElementById("right-intro-indicator");

    while (left_indicator.firstChild) {
        left_indicator.removeChild(left_indicator.firstChild);
    }

    while (right_indicator.firstChild) {
        right_indicator.removeChild(right_indicator.firstChild);
    }
}

function new_modal() {
    let original = document.querySelector("#percent50-background");
    let clone = original.cloneNode(true);

    gsap.to(clone, {zIndex: 100, duration: 0});

    clone.classList.add("clone");

    let modal = clone.children[0];
    modal.id = "clone";

    while (modal.firstChild) {
        modal.removeChild(modal.firstChild);
    }
    console.log(clone);
    document.body.appendChild(clone);

    return clone
}

function append_new_element(type, parent, id="", typeclass="", style={}) {
    let item = document.createElement(type);

    if (typeclass !== "") {
        item.classList.add(typeclass);
    }
    if (id !== "") {
        item.setAttribute("id", id);
    }
    for (let key in style) {
        item.style[key] = style[key];
    }

    parent.appendChild(item);

    return item;
}

function intro_modal() {
    complete_signal.connect("listener", () => {
        complete_signal.disconnect("listener");
        add_to("Finding session data...", "left");
        add_to("[ OK ]", "right");

        get_session_data()
        document.querySelectorAll('.clone').forEach(clone => clone.remove());
    });

    let modal = new_modal().children[0];
    let input = new Input();

    gsap.to(modal, {width: "fit-content", height: "fit-content",left: "50%", top: "70%", fontFamily: "Inconsolata", textAlign: "center", backgroundColor: "rgba(0,0,0,0)", duration: 0});
    
    let title = append_new_element("h3", modal, "","", {margin: 0});
    let subtitle = append_new_element("h4", modal, "","", {margin: "-2%", fontWeight: "normal"});
    title.innerHTML = "--- KEYBOARD MODULE CHECK ---";
    subtitle.innerHTML = "hold down the keys for 5 seconds.";

    let container = append_new_element("div", modal, "","", {margin: 0, display: "flex", justifyContent: "space-around", alignItems: "center"});

    let keys = "qwop";
    let key_array = {};
    let countdownInterval = null;

    // Create divs for each key
    for (let key of keys) {
        let div = append_new_element("div", container, key, "key-indicator", {fontSize: "2em", fontWeight: "bold"});
        div.textContent = key.toUpperCase();

        key_array[key] = false;

        input.keyDown.connect("keylistener" + key, key_down => {
            if (key_down[0].toLowerCase() === key) {
                div.style.color = "green";
                key_array[key] = true;
                checkKeysAndStartCountdown();
            }
        });

        input.keyUp.connect("keylistener" + key, key_up => {
            if (key_up[0].toLowerCase() === key) {
                div.style.color = "white";
                key_array[key] = false;
                stopCountdown();
            }
        });
    }

    function checkKeysAndStartCountdown() {
        // Check if all keys are true
        if (Object.values(key_array).every(value => value)) {
            if (!countdownInterval) {
                startCountdown();
            }
        }
    }

    function startCountdown() {
        let countdown = 5; // Countdown starts at 5 seconds
        console.log("Countdown started!");

        countdownInterval = setInterval(() => {
            subtitle.innerHTML = "Hold for : " + countdown;

            if (countdown <= 0) {
                clearInterval(countdownInterval);
                countdownInterval = null;

                complete_signal.fire();
                input.destroy();
            }
            countdown--;
        }, 1000);
    }

    function stopCountdown() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
            console.log("Countdown stopped!");
            subtitle.innerHTML = "hold down the keys for 5 seconds.";
        }
    }

    return true;
}

function move_session_data() {
    complete_signal.connect("listener", () => {
        complete_signal.disconnect("listener");
        add_to("Registering systems...", "left");
        add_to("[ OK ]", "right");


        start_game();
    });

    let final_data = Local.get("finalData", true);
    console.log(final_data);

    if (!typeof(final_data) == "object" || final_data == null) {
        final_data = {};
    }

    final_data[data.date] = {
        date: data.date,
        time: data.time,

        username: data.username,
        finish_time: "DNF",
        difficulty_index: data.difficulty_index
    }

    Local.set("finalData", final_data, true);

    complete_signal.fire();
}

function start_game() {
    complete_signal.connect("listener", () => {
        complete_signal.destroy();
        add_to("[ OK ]", "right");
    });

    Game.set_game_intervals(data);

    complete_signal.fire();
    setTimeout(_ => document.querySelector(".fixed-fullscreen").remove(), 2000)
}

function get_session_data() {
    complete_signal.connect("listener", () => {
        complete_signal.disconnect("listener");
        add_to("Moving session data...", "left");
        add_to("[ OK ]", "right");

        move_session_data();
    });

    data = Session.get("parameters", true);
    if (!data) {
        add_to("- No session data active!", "left");
        add_to("-", "right");

        data = {
            date: new Date().toISOString(),
            time: new Date().getTime(),

            username: "guest", // replace with last user's name
            difficulty_index: 700,
        }
    }

    complete_signal.fire();
}



function interactive() {
    // open modal prompt for keyboard
    add_to("Checking module keyboard...", "left");

    intro_modal()
}

if (skip_all) {
    document.querySelector("#intro").style.width = "100%";
    document.querySelector("#intro").style.height = "80%";
    interactive();
} else {
    intro_timeline
        // initial intro left
        .call(add_to, ["ENCODER INITIATIVE (EI) 2001-2015", "left"], 0)
        .call(add_to, ["Property of EI. Do not replicate nor reproduce this software/hardware.", "left"], 0)
        .call(add_to, ["Any attempts to do such will be faced with repercussions.", "left"], 0)
        .call(add_to, ["SANITY CHECKING (1 of 5)", "left"], 1)
        .call(add_to, ["SANITY CHECKING (2 of 5)", "left"], 1.1)
        .call(add_to, ["SANITY CHECKING (3 of 5)", "left"], 1.1)
        .call(add_to, ["SANITY CHECKING (4 of 5)", "left"], 1.1)
        .call(add_to, ["SANITY CHECKING (5 of 5)", "left"], 1.3)
        .call(add_to, ["AUTHENTICATING MODULES", "left"], 1.4)
        // initial intro right
        .call(add_to, ["-", "right"], 0)
        .call(add_to, ["-", "right"], 0)
        .call(add_to, ["-", "right"], 0)
        .call(add_to, ["[ OK ]", "right"], 1)
        .call(add_to, ["[ OK ]", "right"], 1.1)
        .call(add_to, ["[ OK ]", "right"], 1.1)
        .call(add_to, ["[ OK ]", "right"], 1.1)
        .call(add_to, ["[ OK ]", "right"], 1.4)
        .call(add_to, ["[ OK ]", "right"], 1.7)

        .call(clear, null, 2)
        // initial intro 2 left
        .call(add_to, ["WARNING! MODIFIED REGISTER DETECTED", "left"], 2)
        .call(add_to, ["WARNING! MODIFIED REGISTER DETECTED", "left"], 2.05)
        .call(add_to, ["WARNING! MODIFIED REGISTER DETECTED", "left"], 2.05)
        .call(add_to, ["WARNING! MODIFIED REGISTER DETECTED", "left"], 2.2)
        .call(add_to, ["WARNING! MODIFIED REGISTER DETECTED", "left"], 2.2)
        .call(add_to, ["WARNING! MODIFIED REGISTER DETECTED", "left"], 2.3)
        .call(add_to, ["CRITICAL! System Optimizations have failed.", "left"], 3)
        .call(add_to, ["- open log to view error", "left"], 3)
        .call(clear, null, 2)
        .call(add_to, ["0x73F0DA", "right"], 2)
        .call(add_to, ["0x03905C", "right"], 2.05)
        .call(add_to, ["0xAD8F3D", "right"], 2.05)
        .call(add_to, ["0x0AF85D", "right"], 2.2)
        .call(add_to, ["0xB1FF7F", "right"], 2.2)
        .call(add_to, ["0xAD1B19", "right"], 2.2)

        .call(clear, null, 3.2)
        // initial intro 3 left
        .call(add_to, ["Loading Unit monitor1", "left"], 3.2)
        .call(add_to, ["Loading Unit submonitor2", "left"], 3.2)
        .call(add_to, ["Loading Unit submonitor3", "left"], 3.2)
        .call(add_to, ["Loading Unit interfacemanager", "left"], 3.3)
        .call(add_to, ["P2P integration...", "left"], 4)
        .call(add_to, ["Running checks...", "left"], 4)
        .to("#intro", {opacity: 0, duration: 0}, 4.5)
        .to("#intro", {opacity: 1, width: "100%", height: "80%", duration: 0}, 4.6)
        .call(add_to, ["PREREQUISITES COMPLETE! Loading...", "left"], 5)
        // initial intro 3 right
        .call(add_to, ["[ OK ]", "right"], 3.2)
        .call(add_to, ["[ OK ]", "right"], 3.2)
        .call(add_to, ["[ OK ]", "right"], 3.2)
        .call(add_to, ["[ OK ]", "right"], 3.7)
        .call(add_to, ["[ OK ]", "right"],  4)
        .call(add_to, ["[ OK ]", "right"],  5)

        // interactive intro
        .call(clear, null, 5.5)
        .call(interactive, null, 5.5) // call interactive function
}