var system_array = {}

/*
    TODO:
        Create processing function for all variables
            'NORMAL'           normal processing
            'CHAMBER_DAMAGE'   
            'BURNT'             
            'DESTROYED'        nothing happens, everything is dead
        Cure to cancer
        Random events (the game concept right there)
        fix bug: TEMPLATE_UNIT is being referenced and not copied when passing as an argument
*/

const TEMPLATE_UNIT = {
    variables: {
        on_fire: false,          // simple boolean variables
        destroyed: false,        // -
        disconnected: false,     // -
        chamber_damage: false,   // -

        processor_temperature: 0,// processing temperature (in kelvin)
        chamber_pressure: 1,     // pressure (in atm)

        coolant_temperature: 25, // temperature (in kelvin)
        coolant_amount: 0,       // amount (in liters)
        coolant_in_flow: 0,      // rate of flow (in liters per second)
        coolant_out_flow: 0,     // rate of flow (in liters per second)

        power_in: 0,             // amount of power (in kilowatts)
        unit_health: 100,        // general health

        sync_level: 0,           // synchronization level (must be matched with other units)
        queue: 0,                // amount in queue to process
        processor_time: 0,       // time to clear an item out of the queue

        _chamber_pressure_rate: 0,// rate of ascent/descent [negative - down / positive - up]
        _coolant_temp_rate: 0,    // the underscore denotes that it is not accessible by normal means
        _coolant_amount_rate: 0,  // -
        _processor_temp_rate: 0,  // -

        _max_coolant_temp: 0,     // maximum amount that is available
        _max_coolant_in_flow: 0,  // the underscore denotes that it is not accessible by normal means
        _max_coolant_out_flow: 0, // -
        _max_coolant_amount: 0,   // -
        
        _max_processor_temp: 0,   // -
        _max_chamber_pressure: 0, // -
        _max_power_in: 0,         // -
    },

    NORMAL: function() {
        console.log("im in a state machine!", state_machine)
        console.log(state_machine.get_value_table())
    },

    CHAMBER_DAMAGE: state_machine => {
        
    },

    BURNT: state_machine => {

    },

    DESTROYED: state_machine => {
        
    },
}

for (let i = 0; i < 12; i++) {
    // let copy = {};
    // for(var key in TEMPLATE_UNIT)
    // {
    //     copy[key] = TEMPLATE_UNIT[key];
    // }

    system_array[i] = new StateMachine(structuredClone(TEMPLATE_UNIT), "NORMAL");
}

system_array[0].set_value("destroyed", true);
for (let i = 0; i < 12; i++) {
    system_array[i].change_state("NORMAL");
}

function trigger(n){
    console.log("clicked on ",n)
}

// unit interval
//setInterval(event => {
//    console.log("wow!")
//}, 50) // 20 ticks a second

// observer interval
//setInterval(event => {
//    console.log("wow!")
//}, 1000)