let test_signal = new Signal;

test_signal.connect("yes", wow => {
    console.log("I have recieved the following:", wow[0]);
})

test_signal.fire("WOW!")
test_signal.fire("NO!")
test_signal.fire("YES!")

test_signal.destroying.connect("no", _ => {
    console.log("Test signal is now being removed.");
})
test_signal.disconnect("yes");
test_signal.fire() // doesn't fire because the yes function is removed

test_signal.destroy()
test_signal.fire() // doesn't fire because there aren't any recievers