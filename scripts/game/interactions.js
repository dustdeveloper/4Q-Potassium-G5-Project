/*
    TODO:
        * note: finish normal first before continuing to other functions
        Create processing function for all variables
            'NORMAL'           normal processing
            'CHAMBER_DAMAGE'   
            'BURNT'             
            'DESTROYED'        nothing happens, everything is dead
        Cure to cancer
        via items in queue - Random events (the game concept right there)
*/

/*
    EXAMPLE ITEM
    state_machine => {
            -- edit variables from here
        }
*/

// fixed // bug: TEMPLATE_UNIT is being referenced and not copied when passing as an argument

//Variable Declaration
var system_objects = {};
var dead = 0;
var score = 0;
var time = 0;
var data = {};
var is_game_over = false;

const clamp = (num, min, max) => Math.min(Math.max(num, min), max) // Range Limit

function new_log(text , color = "yellow") {
    let beep = new Sound("../../assets/audio/log_beep.mp3", 0.5);
    beep.play();

    let log = document.querySelector("#log");
    let new_log = append_new_element("p", log, "cl", "", {color: color});
    new_log.innerHTML = text;
    
    log.scrollTop = log.scrollHeight; // scroll to bottom
}

//Execution
function template_unit_generate(identifier) //One Unit
{
    let unit = {};
    
    unit.variables = {
        identifier: identifier,
        
        powered: false,

        base_coolant: 0,
        processor_temperature: 5,// processing temperature (in Degree Celcius)

        chamber_pressure: 1,     // pressure (in atm)

        coolant_temperature: -50, // temperature (in Degree Celcuius)
        coolant_amount_max: 600, // maximum amount of coolat (in liters)
        coolant_amount: 100,       // amount (in liters)
        coolant_in_flow: 0.25,      // rate of flow (in liters per tick)
        coolant_out_flow: -0.25,     // rate of flow (in liters per tick)

        power_in: 0,             // amount of power (in kilowatts)
        queue: [],               // items in queue to process

        is_in_warning: false, // if the unit is in warning state
        is_in_warning_power: false,

        //Pressure & Amount
        _coolant_amount_rate: 0, 

        cd_signal: new Signal(),
        destroyed_signal: new Signal(),
    }

    unit.NORMAL = (state_machine, tick) => {
        //Calculations
        //Coolant Amount
        state_machine.set_value("_coolant_amount_rate", 
            clamp((state_machine.get_value("coolant_in_flow") + state_machine.get_value("coolant_out_flow") + state_machine.get_value("base_coolant")).toFixed(2), -1, 2)
        );

        state_machine.set_value("coolant_amount",
            clamp((state_machine.get_value("coolant_amount") + state_machine.get_value("_coolant_amount_rate")).toFixed(2), 0, state_machine.get_value("coolant_amount_max"))
        );

        //Chamber Pressure
        state_machine.set_value("chamber_pressure",
            clamp(((Math.cbrt(state_machine.get_value("coolant_amount")) * Math.cbrt(state_machine.get_value("coolant_amount")) * (9.81)) / (Math.cbrt(state_machine.get_value("coolant_amount_max")) * Math.cbrt(state_machine.get_value("coolant_amount_max")))).toFixed(2), 0, 9.81)
        );
        
        //Coolant Temperature
        state_machine.set_value("coolant_temperature",
            clamp(((state_machine.get_value("coolant_amount") * state_machine.get_value("chamber_pressure")) / (62.07*0.08206)).toFixed(2), 0, 1155.5981)
        );
        
        state_machine.set_value("processor_temperature",
            clamp((state_machine.get_value("coolant_temperature") / 11.555981).toFixed(2), 0, 100)
        );
        
        //Power
        state_machine.set_value("power_in",
            clamp(((state_machine.get_value("chamber_pressure") * state_machine.get_value("coolant_amount")) / (time / data.difficulty_index)).toFixed(2), 0.01, 58860)
        );

        if (state_machine.get_value("chamber_pressure") >= 9) {
            // chamber damage event
            state_machine.set_value("chamber_damage", true);
            state_machine.get_value("cd_signal").fire();
            new_log("Chamber failure detected in " + state_machine.get_value("identifier") + " [REF :: CD]", "red")
            state_machine.change_state("CHAMBER_DAMAGE");
        };

        if (state_machine.get_value("chamber_pressure") >= 7) { // warn
            if (state_machine.get_value("is_in_warning")) {
                return;
            }
            state_machine.set_value("is_in_warning", true);
            new_log("Pressure safety threshold exceeding 7 in UNIT " + state_machine.get_value("identifier") + " [REF :: AAA_00001]");
        } else {
            state_machine.set_value("is_in_warning", false);
        }

        if (state_machine.get_value("power_in") < 50) { // power_in implementation
            if (state_machine.get_value("is_in_warning_power")) {
                return;
            }
            state_machine.set_value("is_in_warning_power", true);
            new_log("Power input is below safety threshold in UNIT " + state_machine.get_value("identifier") + " [REF :: AAA_00001]");
        } else {
            state_machine.set_value("is_in_warning_power", false);
        };

        // ? "updates every half a second" section
        if (tick <= 10) {
            return;
        };

        if (state_machine.get_value("power_in") < 10) { // power_in implementation
            state_machine.set_value("powered", false);

            state_machine.get_value("destroyed_signal").fire();

            let track = new Track("../../assets/audio/explosion.mp3", 0.3);

            setTimeout(() => {
                track.play();
            }, 1500);

            state_machine.change_state("DESTROYED");
            return;
        };

        state_machine.set_value("powered", true);

        let item = state_machine.get_value("queue")[0];
        if (item == null) { return };

        for (let [key, value] of Object.entries(item)) {
            state_machine.set_value(key, value);
        };

        state_machine.get_value("queue").shift();
    };

    unit.CHAMBER_DAMAGE = (state_machine, tick) => { // relies on chamber_damage variable
        //Calculations
        //Coolant Amount
        state_machine.set_value("_coolant_amount_rate", 
            clamp((state_machine.get_value("coolant_in_flow") + state_machine.get_value("coolant_out_flow") + state_machine.get_value("base_coolant")).toFixed(2), -1, 0.5)
        );

        state_machine.set_value("coolant_amount",
            clamp((state_machine.get_value("coolant_amount") + state_machine.get_value("_coolant_amount_rate")).toFixed(2), 0, 200) // ! different
        );

        //Chamber Pressure
        state_machine.set_value("chamber_pressure",
            clamp(((Math.cbrt(state_machine.get_value("coolant_amount")) * Math.cbrt(state_machine.get_value("coolant_amount")) * (9.81)) / (Math.cbrt(state_machine.get_value("coolant_amount_max")) * Math.cbrt(state_machine.get_value("coolant_amount_max")))).toFixed(2), 0, 1) // ! different
        );
        
        //Coolant Temperature
        state_machine.set_value("coolant_temperature",
            clamp(((state_machine.get_value("coolant_amount") * state_machine.get_value("chamber_pressure")) / (62.07*0.08206)).toFixed(2), 0, 1155.5981)
        );
        
        state_machine.set_value("processor_temperature",
            clamp((state_machine.get_value("coolant_temperature") / 9.555981).toFixed(2), 0, 100) // ! different
        );
        
        //Power
        state_machine.set_value("power_in",
            clamp(((state_machine.get_value("chamber_pressure") * state_machine.get_value("coolant_amount")) / (time / (data.difficulty_index/200))).toFixed(2), 0.01, 58860/2) // ! different
        );

        if (state_machine.get_value("power_in") < 50) { // power_in implementation
            if (!state_machine.get_value("is_in_warning_power")) {

                state_machine.set_value("is_in_warning_power", true);
                new_log("Power input is below safety threshold (> 50) in UNIT " + state_machine.get_value("identifier") + " [REF :: AAA_00001]");
            }
        } else {
            state_machine.set_value("is_in_warning_power", false);
        };

        // ? "updates every half a second" section
        if (tick <= 10) {
            return;
        };

        if (state_machine.get_value("power_in") < 10) { // power_in implementation
            state_machine.set_value("powered", false);

            state_machine.get_value("destroyed_signal").fire();

            let track = new Track("../../assets/audio/explosion.mp3", 0.3);

            setTimeout(() => {
                track.play();
            }, 1500);

            state_machine.change_state("DESTROYED");
            return;
        };

        state_machine.set_value("powered", true);

        let item = state_machine.get_value("queue")[0];
        if (item == null) { return };

        for (let [key, value] of Object.entries(item)) {
            state_machine.set_value(key, value);
        };

        state_machine.get_value("queue").shift();
    };

    unit.DESTROYED = (state_machine, tick) => { // relies on destroyed
        // does nothing
    };

    return unit;
}

class Game {
    constructor(){};

    static set_game_intervals(data) {

        //Generate new statemachines for the units
        for (let i = 0; i < 12; i++) {
            let visible_number = i+1
            let state_machine = new StateMachine(template_unit_generate(visible_number), "NORMAL");
            system_objects[i] = state_machine;

            let element = document.querySelector("#u"+visible_number);
            element.querySelector("h4").innerHTML = "UNIT "+ (visible_number < 10 ? '0' + visible_number : visible_number.toString())

            element.addEventListener("click", _ => {
                Observer.change_lookat(visible_number-1);
            })

            state_machine.get_value("cd_signal").connect("destroyed", _ => {
                let element = document.querySelector("#u"+state_machine.get_value("identifier"));
                element.querySelector("hr").style.backgroundColor = "orange";

            });

            state_machine.get_value("destroyed_signal").connect("destroyed", _ => {
                let element = document.querySelector("#u"+state_machine.get_value("identifier"));
                element.querySelector("hr").style.backgroundColor = "black";
                new_log("UNIT " + state_machine.get_value("identifier") + " DISCONNECTED [REF :: DISCONNECTED]", "red")

                dead+=1
                time = 0;
            });
        }

        data = data;
    
        //Unit interval
        setInterval(_ => {
            if (is_game_over) {
                return;
            }
            for (let i = 0; i < 12; i++) {
                system_objects[i].tick();
            };
            time = time + 0.05;

            if (!(dead >= 12)) {
                score = Math.floor(score + 0.1 * data.difficulty_index); // score calculation\
                document.querySelector("#score").innerHTML = score;
            } else {
                is_game_over = true;

                let element = append_new_element("div", document.querySelector("body"), "percent50-background", "fixed-fullscreen", {
                    textAlign: "center",
                });
                append_new_element("h3", element, "", "", {
                    fontFamily: "monospace",
                    fontSize: "3em",
                }).innerHTML = "Game Over";
                append_new_element("h4", element, "", "", {
                    fontFamily: "monospace",
                    fontSize: "2em",
                }).innerHTML = "Score: " + score;
                

                // SAVE DATA
            }
        }, 50) // 20 ticks a second
    
        // new queue event interval
        setInterval(_ => {
            if (is_game_over) {
                return;
            }

            for (let [_, state_machine] of Object.entries(system_objects)) {
                let queueable_objects = {   // variables for it to edit
                    coolant_in_flow: 1,      // rate of flow (in liters per tick)
                    coolant_out_flow: 1,     // rate of flow (in liters per tick)
                };
                
                queueable_objects["coolant_in_flow"] = Number((Math.random() * (-1 - 1 + 1) + 1).toFixed(2))
                queueable_objects["coolant_out_flow"] = Number(((Math.random() * (-2 - 0.3 + 1) + 1) * -1).toFixed(2))
                // code that randomly selects the items within the queue_items array
    
                state_machine.get_value("queue").push(queueable_objects);
            }
        }, 1000)
    
        Observer.start_now(system_objects);
    }
};