let states = {
    "stateone": function t(){
        console.log("Rah!")
    },
    "statetwo": function t(){
        console.log("Reh!")
    },
    "statethree": function t(){
        console.log("Rih!")
    }
}

let test_state_machine = new StateMachine(states);

test_state_machine.change_state("stateone")
test_state_machine.change_state("statetwo")
test_state_machine.change_state("statethree")