let test_sound = new Sound("../Utopian_Dream.mp3", 0.1)

test_sound.sound_is_playable.connect("playableEvent", event => {
    console.log("sound is now playable!")
})

test_sound.playing.connect("playing", event => {
    console.log("sound is playing!")
})

test_sound.paused.connect("paused", event => {
    console.log("sound is paused!")
})

test_sound.stopped.connect("stopped", event => {
    console.log("sound stopped!")
})