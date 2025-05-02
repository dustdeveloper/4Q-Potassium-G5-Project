var system_array = {};
var variable_tick_array = {};

const clamp = (num, min, max) => Math.min(Math.max(num, min), max) // Range Limit
const addCSS = css => document.head.appendChild(document.createElement("style")).innerHTML=css;

/*
    TODO:
        * note: finish normal first before continuing to other functions
        Create processing function for all variables
            'NORMAL'           normal processing
            'CHAMBER_DAMAGE'   
            'BURNT'             
            'DESTROYED'        nothing happens, everything is dead
        Cure to cancer
        COMPLETE via items in queue - Random events (the game concept right there)
*/

/*
    a tick happens every 1/20 times a second (50 milliseconds in interval).
    so 25 liters a second would equate to 1.25 liters a tick
*/

/*
    EXAMPLE ITEM
    state_machine => {
            -- edit variables from here
        }
*/

// fixed // bug: TEMPLATE_UNIT is being referenced and not copied when passing as an argument

function template_unit_generate(identifier) {
    let unit = {};
    
    unit.variables = {
        identifier: identifier,

        on_fire: false,          // simple boolean variables
        disconnected: false,     // -
        chamber_damage: false,   // -

        processor_temperature: 5,// processing temperature (in kelvin)
        chamber_pressure: 1,     // pressure (in atm)

        coolant_temperature: -50, // temperature (in kelvin)
        coolant_amount: 100,       // amount (in liters)
        coolant_in_flow: 0.25,      // rate of flow (in liters per tick)
        coolant_out_flow: -0.25,     // rate of flow (in liters per tick)

        power_in: 0,             // amount of power (in kilowatts)
        unit_health: 100,        // general health

        sync_level: 0,           // synchronization level (must be matched with other units)
        queue: [],                // items in queue to process

        // rate of ascent/descent per tick [negative - down / positive - up]
        // the underscore denotes that it is not accessible by normal means

        _chamber_pressure_rate: 0,
        _coolant_temp_rate: 0,    
        _coolant_amount_rate: 0,  
        _processor_temp_rate: 0,  
        _unit_health_rate: 0, 

        disconnected_signal: new Signal(),
        destroyed_signal: new Signal(),
        on_fire_signal: new Signal(),
        stop_fire: new Signal(),
    }

    unit.NORMAL = (state_machine, tick) => {
        // !  No unit_health implementation added. Please do in next revision
        // !  Clamp everything in the next revision

        // setting coolant amount rate
        state_machine.set_value("_coolant_amount_rate", 
            clamp((state_machine.get_value("coolant_in_flow") + state_machine.get_value("coolant_out_flow")).toFixed(2), -1, 1)
        );

        // change coolant temperatures based on amount and processor temperatures
        // ? the coldest that the coolant can get is -600 kelvin
        // ? the coldest that the processor can get is -200 kelvin

        // ? temporary fix - set temperature rates for processor and coolant

        // check if the coolant is stagnant 
        if (state_machine.get_value("coolant_in_flow") < 1 || state_machine.get_value("coolant_out_flow") > -1) {
            // * temporary placeholder
            state_machine.set_value("_coolant_temp_rate", 
                0.05
            );
        } else {
            // * temporary placeholder
            if (state_machine.get_value("coolant_temperature") > -30) {
                state_machine.set_value("_coolant_temp_rate", 
                    -0.5
                );
                return;
            };
            state_machine.set_value("_coolant_temp_rate", 
                0
            );
        };

        state_machine.set_value("_processor_temp_rate",
            state_machine.get_value("coolant_temperature")/1000
        )
        

        // chamber pressure processing
        // check if coolant amount is over 250 liters.
        // if over, count the excess and plug it into a exponential func and set it on _chamber_pressure_rate
        
        if (state_machine.get_value("coolant_amount") > 250) {
            let excess = state_machine.get_value("coolant_amount") - 250
            state_machine.set_value("_chamber_pressure_rate",
                parseFloat((0.1*(Math.pow(1.01, excess - 10) - 1)).toFixed(2)) // * make a more realistic pressure gen
            );

        } else {
            state_machine.set_value("_chamber_pressure_rate", 0);
        };

        // updating coolant amount
        state_machine.set_value("coolant_amount",
            parseFloat(state_machine.get_value("coolant_amount") + state_machine.get_value("_coolant_amount_rate"))
        );

        // updating processor temperatures
        state_machine.set_value("processor_temperature",
            clamp(state_machine.get_value("processor_temperature") + state_machine.get_value("_processor_temp_rate"), -200, 300)
        );

        // updating coolant temperatures
        state_machine.set_value("coolant_temperature",
            state_machine.get_value("coolant_temperature") + state_machine.get_value("_coolant_temp_rate")
        );

        // updating chamber pressure
        state_machine.set_value("chamber_pressure",
            clamp(state_machine.get_value("chamber_pressure") + state_machine.get_value("_chamber_pressure_rate"), 0, 40)
        );

        ////console.log(state_machine.get_value("chamber_pressure"), " rate: ", state_machine.get_value("_chamber_pressure_rate"))

        if (state_machine.get_value("chamber_pressure") >= 40) {
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

        if (state_machine.get_value("power_in") < 50) { // power_in implementation
            return;
        };

        let item = state_machine.get_value("queue")[0];
        if (typeof(item) == "function") {
            item(state_machine);
            state_machine.set_value("sync_level", state_machine.get_value("sync_level") + 1)
        };
    };

    unit.CHAMBER_DAMAGE = (state_machine, tick) => { // relies on chamber_damage variable
        
    };

    unit.BURNT = (state_machine, tick) => { // relies on finishing on_fire completion variable

    };

    unit.DESTROYED = (state_machine, tick) => { // relies on destroyed
        
    };

    return unit;
}

// generate new statemachines for the units
for (let i = 0; i < 12; i++) {
    system_array[i] = new StateMachine(template_unit_generate(i+1), "NORMAL");

    system_array[i].get_value("stop_fire").connect("fire_extinguished", event => {
        if (!system_array[i].get_value("on_fire")) {
            return;
        };

        console.log("Fire stopped!")
        system_array[i].set_value("on_fire", false);
        system_array[i].change_state("BURNT");
    });
}

function trigger(n){
    console.log("clicked on ",n)
}

// unit interval
setInterval(event => {
    for (let i = 0; i < 12; i++) {
        system_array[i].tick();
    }
}, 50) // 20 ticks a second

// observer interval
setInterval(event => {
    // attach them to the panels
    for (let i = 1; i < 13; i++) {
        switch(system_array[i-1].get_state()) {
            case "NORMAL":
                document.getElementById("unit-"+i).style.animation = "none";
            case "CHAMBER_DAMAGE":
                document.getElementById("unit-"+i).style.animation = "flash-two 1s linear infinite";
            case "BURNT":
                document.getElementById("unit-"+i).style.animation = "flash-three 1s linear infinite";
            case "DESTROYED":
                document.getElementById("unit-"+i).style.animation = "dead 1s linear infinite";
        }
        console.log("updated! ", "unit-"+i)
    }
}, 1000)