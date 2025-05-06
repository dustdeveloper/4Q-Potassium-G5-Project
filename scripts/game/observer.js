var last_visible_number = 1;
var lookat = 0;

class Observer {
    constructor (){};

    static start_now(system_objects) {
        setInterval(_ => {

            for (let [key, value] of Object.entries(system_objects[lookat].get_value_table())) {
                let item = document.querySelector("#"+key);
                if (!item) {
                    continue;
                };
                item.innerHTML = key+"&nbsp;&nbsp;&nbsp;&nbsp;"+value;
            };

        }, 1)
    }

    static change_lookat(numero) {
        let visible_number = numero + 1;

        console.log(visible_number)
        let element = document.querySelector("#u"+visible_number);
        element.querySelector("h4").style.color = "yellow";

        let last_element = document.querySelector("#u"+last_visible_number);
        last_element.querySelector("h4").style.color = "black";

        last_visible_number = visible_number;

        document.querySelector("#left-monitor > h2").innerHTML = "Selected Unit: " + (visible_number < 10 ? '0' + visible_number : visible_number.toString());
        lookat = numero || 0;
    }
}