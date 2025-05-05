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
var variable_tick_objects = {};
var time = 0;
var data = {};

const clamp = (num, min, max) => Math.min(Math.max(num, min), max) // Range Limit

//Execution
function template_unit_generate(identifier) //One Unit
{
    let unit = {};
    
    unit.variables = {
        identifier: identifier,

        on_fire: false,          // simple boolean variables
        disconnected: false,     // -
        chamber_damage: false,   // -
        powered: false,

        processor_temperature: 5,// processing temperature (in Degree Celcius)

        chamber_pressure: 1,     // pressure (in atm)

        coolant_temperature: -50, // temperature (in Degree Celcuius)
        coolant_amount_max: 600, // maximum amount of coolat (in liters)
        coolant_amount: 100,       // amount (in liters)
        coolant_in_flow: 0.25,      // rate of flow (in liters per tick)
        coolant_out_flow: -0.25,     // rate of flow (in liters per tick)

        power_in: 0,             // amount of power (in kilowatts)
        unit_health: 100,        // ! NOT DONE general health

        sync_level: 0,           // ! NOT DONE synchronization level (must be matched with other units)
        queue: [],               // ! NOT DONE items in queue to process

        //Pressure & Amount
        _coolant_amount_rate: 0, 

        //Health
        _unit_health_rate: 0,

        disconnected_signal: new Signal(),
        destroyed_signal: new Signal(),
        on_fire_signal: new Signal(),
        stop_fire: new Signal(),
    }

    unit.NORMAL = (state_machine, tick) => 
        {
            //Calculations
            //Coolant Amount
            state_machine.set_value("_coolant_amount_rate", 
                clamp((state_machine.get_value("coolant_in_flow") + state_machine.get_value("coolant_out_flow")).toFixed(2), -1, 1)
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
                state_machine.change_state("CHAMBER_DAMAGE");
            };
    
            if (state_machine.get_value("processor_temperature") > 100) {
                // fire event
                state_machine.get_value("on_fire", true);
                state_machine.set_value("chamber_damage", true);
                state_machine.get_value("on_fire_signal").fire();
            };

            // ? "updates every half a second" section
            if (tick <= 10) {
                return;
            };

            if (state_machine.get_value("power_in") < 10) { // power_in implementation
                state_machine.set_value("powered", false);
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
    };

    unit.BURNT = (state_machine, tick) => { // relies on finishing on_fire completion variable
    };

    unit.DESTROYED = (state_machine, tick) => { // relies on destroyed
    };

    return unit;
}


//Generate new statemachines for the units
for (let i = 0; i < 12; i++) {
    system_objects[i] = new StateMachine(template_unit_generate(i+1), "NORMAL");

    system_objects[i].get_value("stop_fire").connect("fire_extinguished", _ => {
        if (!system_objects[i].get_value("on_fire")) {
            return;
        };

        console.log("Fire stopped!")
        system_objects[i].set_value("on_fire", false);
        system_objects[i].change_state("BURNT");
    });
}
class Game {
    constructor(){};

    static set_game_intervals(data) {
        data = data;
    
        //Unit interval
        setInterval(_ => {
            for (let i = 0; i < 12; i++) {
                system_objects[i].tick();
            };
            time = time + 0.05;
    
            let lookat = 0
    
            // debugger
            for (let [key, value] of Object.entries(system_objects[lookat].get_value_table())) {
                let item = document.querySelector("#"+key);
                if (!item) {
                    continue;
                };
                item.innerHTML = key+"&nbsp;&nbsp;&nbsp;&nbsp;"+value;
            };
        }, 50) // 20 ticks a second
    
        // new queue event interval
        setInterval(_ => {
            for (let [_, state_machine] of Object.entries(system_objects)) {
                let queueable_objects = {   // variables for it to edit
                    coolant_in_flow: 1,      // rate of flow (in liters per tick)
                    coolant_out_flow: 1,     // rate of flow (in liters per tick)
                };
                
                queueable_objects["coolant_in_flow"] = Number((Math.random() * (-1.3 - 1 + 1) + 1).toFixed(2))
                queueable_objects["coolant_out_flow"] = Number(((Math.random() * (-2 - 0.3 + 1) + 1) * -1).toFixed(2))
                // code that randomly selects the items within the queue_items array
    
                state_machine.get_value("queue").push(queueable_objects);
            }
        }, 2000)
    
    
        // //Observer interval
        //  setInterval(event => {
        //      // attach them to the panels
        //      for (let i = 1; i < 13; i++) {
        //          switch(system_objects[i-1].get_state()) {
        //              case "NORMAL":
        //                  document.getElementById("unit-"+i).style.animation = "none";
        //              case "CHAMBER_DAMAGE":
        //                  document.getElementById("unit-"+i).style.animation = "flash-two 1s linear infinite";
        //              case "BURNT":
        //                  document.getElementById("unit-"+i).style.animation = "flash-three 1s linear infinite";
        //              case "DESTROYED":
        //                  document.getElementById("unit-"+i).style.animation = "dead 1s linear infinite";
        //          }
        //          console.log("updated! ", "unit-"+i)
        //      }
        //  }, 1000)
    }
    
};