var system_array = {};
var variable_tick_array = {};

const clamp = (num, min, max) => Math.min(Math.max(num, min), max) // RAHHHh!hh!h!h!h!h!h!h!h!h

/*
    TODO:
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

        disconnected_signal: new Signal(),
        destroyed_signal: new Signal(),
        on_fire_signal: new Signal(),
    }

    unit.NORMAL = (state_machine, tick) => {
        // ! No power_in and unit_health implementation added. Please do in next revision

        // setting coolant amount rate
        state_machine.set_value("_coolant_amount_rate", 
            clamp((state_machine.get_value("coolant_in_flow") + state_machine.get_value("coolant_out_flow")), 0, 1)
        );

        // change coolant temperatures based on amount and processor temperatures
        // ? the coldest that the coolant can get is -600 kelvin
        // ? the coldest that the processor can get is -200 kelvin

        // ! UNFINISHED set temperature rates for processor and coolant

        // check if the coolant is stagnant 
        if (state_machine.get_value("coolant_in_flow") < 1.25 || state_machine.get_value("coolant_out_flow") > -1.25) {
            // ! UNFINISHED stagnant coolant section
            state_machine.set_value("_coolant_temp_rate", 
                
            );
        } else {
            // ! UNFINISHED flowing coolant section 
            state_machine.set_value("_coolant_temp_rate", 

            );
        };

        // chamber pressure processing
        // check if coolant amount is over 250 liters.
        // if over, count the excess and plug it into a exponential func and set it on _chamber_pressure_rate
        
        if (state_machine.get_value("coolant_amount") > 250) {
            let excess = state_machine.get_value("coolant_amount") - 250

            state_machine.set_value("_chamber_pressure_rate",
                clamp(parseFloat((0.001*(Math.pow(1.01, excess - 10) - 1)).toFixed(2)), 0, 0.03) // * make a more realistic pressure gen
            );
        } else {
            state_machine.set_value("_chamber_pressure_rate", 0);
        };

        // updating coolant amount
        state_machine.set_value("coolant_amount",
            clamp(state_machine.get_value("coolant_amount") + state_machine.get_value("_coolant_amount_rate"), 0, 1000)
        );

        // updating processor temperatures
        state_machine.set_value("processor_temperature",
            clamp(state_machine.get_value("processor_temperature") + state_machine.get_value("_processor_temp_rate"), -200, 300)
        );

        // updating coolant temperatures
        state_machine.set_value("coolant_temperature",
            clamp(state_machine.get_value("coolant_temperature") + state_machine.get_value("_coolant_temp_rate"), -600, 300)
        );

        // updating chamber pressure
        state_machine.set_value("chamber_pressure",
            clamp(state_machine.get_value("chamber_pressure") + state_machine.get_value("_chamber_pressure_rate"), 0, 40)
        );

        console.log(state_machine.get_value("chamber_pressure"), " rate: ", state_machine.get_value("_chamber_pressure_rate"))
        if (state_machine.get_value("chamber_pressure") >= 40) {
            console.log("coolant overflow")

            state_machine.set_value("chamber_damage", true);
            state_machine.change_state("CHAMBER_DAMAGE");
        }

        // ? "updates every half a second" section
        if (tick <= 10) {
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
    console.log(system_array[0].get_value_table())
}, 1000)