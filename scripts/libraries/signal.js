// signals are vital for event-driven logic
// this implements a simple signal class similar to ROBLOX.

// NOTE: fire() returns the args to the recievers as an array [].

class _CrippledSignal { // DO NOT USE THIS CLASS
    constructor() {
        this.reciever_dict = {};
    }

    connect(name, reciever_function) {
        // you pass the name and reciever function here
        // it appends the function to dictionary to be run by fire()
        if (this.reciever_dict[name]) {
            return false;
        };

        if (!(typeof reciever_function === 'function')) {
            console.error("invalid function passed! name: ", name)
            return false;
        };

        this.reciever_dict[name] = reciever_function;
        return true;
    };

    disconnect(name) {
        // you pass the name of the function here to be removed by the dictionary
        if (!this.reciever_dict[name]) {
            return false;
        };

        this.reciever_dict[name] = null;
        return true;
    };

    fire(...arg) {
        // it runs the reciever functions in the dictionary
        // sends the arg to the reciever functions if provided
        for (const [_, r_function] of Object.entries(this.reciever_dict)) {
            if (!(typeof r_function === 'function')) {
                continue;
            };

            r_function(arg);
        };
    };

    destroy() {
        // it destroys the signal itself, cleaning it.
        for (const [name, _] of Object.entries(this.reciever_dict)) {
            this.disconnect(name);
        };
        // this doesn't fire the destroy function
    };
}

class Signal extends _CrippledSignal {
    constructor() {
        super();
        this.destroying = new _CrippledSignal(); // used to detect if item is destroying itself
        // crippledsignal implemented due to cyclic references when using self
    }

    destroy() {
        // it destroys the signal itself, cleaning it.
        for (const [name, _] of Object.entries(this.reciever_dict)) {
            this.disconnect(name);
        };
        
        this.destroying.fire(); // fire the destroying signal
        this.destroying.destroy();
        delete this; // no clue if this works or not
    };
}