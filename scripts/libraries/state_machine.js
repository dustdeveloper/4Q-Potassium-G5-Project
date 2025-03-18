// this implements a state machine for static website games
// more on the visual side of the project

class StateMachine {
    // state machine that moves between states
    #states = {};
    #current_state = null;

    constructor(states=null, default_state=null) {
        if (!states) {
            console.warn("No states have been set, beware! Use set_state_dict() to set states.");
            return false;
        };

        this.set_state_dict(states);

        if (default_state) {
            this.change_state(default_state);
            return true;
        };
        console.warn("No default state used. Manually use set_state() to start the state machine.");
        return true;
    };

    set_state(name, state_function) {
        // sets a new state
        if (this.#states[name]) {
            return false;
        };

        if (state_function == null) {
            return false;
        };
        
        this.#states[name] = state_function;
        return true;
    }

    remove_state(name) {
        // removes a state
        if (!this.#states[name]) {
            return false;
        };
        
        this.#states[name] = null;
        return true;
    }

    set_state_dict(states) {
        // overrides the states
        this.#states["variables"] = states["variables"];

        for(let [name, _] of Object.entries(this.#states)) {
            this.remove_state(name);
        };

        for(let [name, state_function] of Object.entries(states)) {
            this.set_state(name, state_function);
        };

        return true;
    }

    get_state() {
        return this.#current_state;
    }

    change_state(name) {
        // starts a new state (usually ran once)
        if (!this.#states[name]) {
            return false;
        };

        this.#current_state = name;
        this.#states[name](this);
        return true;
    }

    set_value(variable, value) {

        this.#states["variables"][variable] = value;
        return this.#states["variables"][variable];
    }

    get_value(variable) {
        return this.#states["variables"][variable];
    }

    get_value_table() {
        return this.#states["variables"];
    }
}