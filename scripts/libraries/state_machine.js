// this implements a state machine for static website games
// more on the visual side of the project

class StateMachine {
    // state machine that moves between states
    #states = {};
    #current_state = null;

    constructor(states=null) {
        if (!states) {
            console.warn("No states have been set, beware! Use set_state_dict() to set states.");
            return;
        };

        this.set_state_dict(states)
    };

    set_state(name, state_function) {
        // sets a new state
        if (this.#states[name]) {
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
        this.#states[name]();
        return true;
    }
}