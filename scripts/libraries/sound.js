class Sound {
    // simple audio wrapper implementation
    audio
    #sound_ok = false

    sound_is_playable = new Signal;

    paused = new Signal;
    stopped = new Signal;
    playing = new Signal;

    constructor(sound_location, volume) {
        this.audio = new Audio(sound_location);
        this.set_volume(volume);
        this.#sound_ok = false;

        this.audio.load()
        this.audio.addEventListener("canplaythrough", event => {
            this.sound_is_playable.fire();
            this.#sound_ok = true
        });

        this.audio.addEventListener("ended", event => {
            this.stopped.fire();
        });

        console.log("audio created")

        return true;
    };

    wait_to_play() {
        console.log("Waiting...")
        this.sound_is_playable.connect("sound", () => {
            console.log("play complete")
            this.play();
            this.sound_is_playable.disconnect("sound");
        });

        if (this.#sound_ok) {
            console.log("play complete (already)")
            this.play();
            this.sound_is_playable.disconnect("sound");
        }
        return true;
    };

    play() {
        if (!this.#sound_ok) {
            return false;
        };

        this.audio.play();
        this.playing.fire();
        return true;
    };
    pause() { // temporarily stops playback
        this.audio.pause();
        this.paused.fire();
    };
    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.stopped.fire();
        return true;
    }

    set_time(number) {
        if (!this.#sound_ok) {
            return false;
        };

        this.audio.currentTime = number;
        return true;
    };
    set_volume(number=1) {
        if (!this.#sound_ok) {
            return false;
        };

        this.audio.volume = number;
        return true;
    };

    set_looped(bool) {
        this.audio.loop = bool;
    };
}

class Track {
    #sound;
    audioContext;
    #sourceNode;
    #gainNode;
    #filters = [];

    constructor(sound_location, volume = 1) {
        this.#sound = new Sound(sound_location, volume);

        this.#sound.audio.crossOrigin = "anonymous"; // Allow cross-origin requests
        this.#sound.audio.preload = "auto"; // Preload the audio

        // Create an AudioContext
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create a source node from the Sound's audio element
        this.#sourceNode = this.audioContext.createMediaElementSource(this.#sound.audio);

        // Create a gain node for volume control
        this.#gainNode = this.audioContext.createGain();
        this.#gainNode.gain.value = volume;

        // Connect the source node to the gain node, and the gain node to the destination
        this.#sourceNode.connect(this.#gainNode).connect(this.audioContext.destination);
    }

    play() {
        // Resume the AudioContext if it's suspended
        if (this.audioContext.state === "suspended") {
            this.audioContext.resume();
        }
        return this.#sound.play();
    }

    pause() {
        this.#sound.pause();
    }

    stop() {
        this.#sound.stop();
    }

    set_volume(volume) {
        this.#gainNode.gain.value = volume;
        this.#sound.set_volume(volume);
    }

    set_looped(loop) {
        this.#sound.set_looped(loop);
    }

    set_time(time) {
        this.#sound.set_time(time);
    }

    add_filter(filterNode) {
        // Add the new filter to the chain
        if (this.#filters.length > 0) {
            this.#filters[this.#filters.length - 1].connect(filterNode);
        } else {
            this.#sourceNode.connect(filterNode);
        }
        filterNode.connect(this.#gainNode);
    
        // Update the filters array
        console.log("Adding filter", filterNode);
        this.#filters.push(filterNode);
    }

    remove_filter(filterNode) {
        const index = this.#filters.indexOf(filterNode);
        if (index !== -1) {
            // Disconnect the filter
            this.#filters[index].disconnect();

            // Remove it from the array
            this.#filters.splice(index, 1);

            // Reconnect the chain
            if (index === 0) {
                this.#sourceNode.connect(this.#filters[0] || this.#gainNode);
            } else if (index < this.#filters.length) {
                this.#filters[index - 1].connect(this.#filters[index]);
            } else {
                this.#filters[index - 1].connect(this.#gainNode);
            }
        }
    }
}