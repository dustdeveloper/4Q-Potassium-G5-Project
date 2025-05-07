var last_visible_number = 1;
var lookat = 0;

var is_modal_open = false;

var selection = "ALLUNITS";
var input_num;

function set_modal(){
    let element = document.querySelector("#command")
    if (is_modal_open) {
        is_modal_open = false;
        element.style.opacity = 0;
    } else {
        is_modal_open = true;
        element.style.opacity = 1;
    }
    element.innerHTML = "&emsp;Select Targets: W - All units, O - Selected unit"
    console.log("modal is ", is_modal_open)
}

function set_count() {
    if (!is_modal_open) {
        return;
    }
    let element = document.querySelector("#command")
    element.innerHTML = "&emsp;"+selection+". Enter new base count: ";

    input_num = append_new_element("input", element, "yo", "", {
        height: "100%",
        width: "25%",
        position: "absolute",
        fontSize: "1.2em",
        fontFamily: "Inconsolata",
        border: "none",
    });
}

function submit_command() {
    if (!is_modal_open) {
        return;
    }
    console.log("submitting")

    let value = Number(input_num.value);
    if (isNaN(value)) {
        gsap.to("#yo", {color: "black", duration: 0});
        gsap.from("#yo", {color: "red", duration: 0.5});
        console.log("failed")
        return;
    }

    console.log("complete")
    switch (selection){
        case "ALLUNITS":
            for (let [_, state_machine] of Object.entries(system_objects)) {
                state_machine.set_value("base_coolant", value);
            }
            console.log("AU COMPLETE")
            break;
        case "CURRENTUNIT":
            system_objects[lookat].set_value("base_coolant", value);
            console.log("CU COMPLETE")
            break;
    }
    set_modal();
}

class Observer {
    constructor (){};

    static start_now(system_objects) {
        setInterval(_ => {

            for (let [key, value] of Object.entries(system_objects[lookat].get_value_table())) {
                let item = document.querySelector("#"+key);
                if (!item) {
                    continue;
                };
                item.innerHTML = key+"&nbsp;&nbsp;&nbsp;&nbsp;"+value;
            };

        }, 1)

        setTimeout(() => {
            let input = new Input();

            input.keyDown.connect("listener", (item) => {
                let key = item[0];

                switch(key){
                    case "q":
                        set_modal();
                        break;
                    case "w":
                        selection = "ALLUNITS";
                        set_count();
                        break;
                    case "o":
                        selection = "CURRENTUNIT";
                        set_count();
                        break;
                    case "p":
                        submit_command();
                        break;
                }
            })
        }, 2000);
    }

    static change_lookat(numero) {
        let visible_number = numero + 1;

        console.log(visible_number)
        let element = document.querySelector("#u"+visible_number);
        element.querySelector("h4").style.color = "yellow";

        let last_element = document.querySelector("#u"+last_visible_number);
        last_element.querySelector("h4").style.color = "black";

        last_visible_number = visible_number;

        document.querySelector("#left-monitor > h2").innerHTML = "Selected Unit: " + (visible_number < 10 ? '0' + visible_number : visible_number.toString());
        lookat = numero || 0;
    }
}