class Sound {
    // simple audio wrapper implementation
    #audio
    #sound_ok = false

    sound_is_playable = new Signal;

    paused = new Signal;
    stopped = new Signal;
    playing = new Signal;

    constructor(sound_location, volume) {
        this.#audio = new Audio(sound_location);
        this.set_volume(volume);

        this.#audio.load()
        this.#audio.addEventListener("canplaythrough", event => {
            this.sound_is_playable.fire();
            this.#sound_ok = true
        });

        this.#audio.addEventListener("ended", event => {
            this.stopped.fire();
        });

        return true;
    };

    play() {
        if (!this.#sound_ok) {
            return false;
        };

        this.#audio.play();
        this.playing.fire();
        return true;
    };
    pause() { // temporarily stops playback
        this.#audio.pause();
        this.paused.fire();
    };
    stop() {
        this.#audio.pause();
        this.#audio.currentTime = 0;
        this.stopped.fire();
        return true;
    }

    set_time(number) {
        if (!this.#sound_ok) {
            return false;
        };

        this.#audio.currentTime = number;
        return true;
    };
    set_volume(number=1) {
        if (!this.#sound_ok) {
            return false;
        };

        this.#audio.volume = number;
        return true;
    };

    set_looped(bool) {
        this.#audio.loop = bool;
    };
}