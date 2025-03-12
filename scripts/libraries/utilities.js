
class Utilities {
    static new_dom_object(object_type){
        return document.createElement(object_type);
    };

    static reparent(object, parent){
        return parent.appendChild(object);
    };

    static clear_out(object){
        Array.from(object.children).forEach(child => {
            object.removeChild(child)
        });

        return true;
    };
}