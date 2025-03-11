class Sound {
    // simple audio wrapper implementation
    #volume
    #audio
    #sound_ok = false

    sound_is_playable = new Signal;

    paused = new Signal;
    stopped = new Signal;
    playing = new Signal;

    constructor(sound_location, volume) {
        this.#volume = volume
        this.#audio = new Audio(sound_location);

        this.#audio.load()
        this.#audio.addEventListener("canplaythrough", event => {
            this.sound_is_playable.fire();
            this.#sound_ok = true
        });

        this.#audio.addEventListener("ended", event => {
            this.stopped.fire()
        })
    };

    play() {
        if (!this.#sound_ok) {
            return false;
        };

        this.#audio.play()
        this.playing.fire()
    };
    pause() { // temporarily stops playback
        this.#audio.pause()
        this.paused.fire()
    };
    stop_at(number) { // schedules when to stop a sound
        this.#audio.stop(number)
    };

    set_time() {

    };
    set_volume() {

    };
}