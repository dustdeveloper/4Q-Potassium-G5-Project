// storage implementation

class StorageInterface {
    constructor() {};

    _is_outdated() {
        return typeof(Storage) == "undefined";
    };

    static get_local_item(item_name) {
        if (_is_outdated()) {
            return false;
        };

        return localStorage.getItem(item_name);
    };

    static set_local_item(item_name, value) {
        if (_is_outdated()) {
            return false;
        };

        localStorage.setItem(item_name, value);
        return true;
    };

    static remove_local_item(item_name) {
        if (_is_outdated()) {
            return false;
        };

        localStorage.removeItem(item_name);
        return true;
    };

    static clear() {
        if (_is_outdated()) {
            return false;
        };

        localStorage.clear();
        return true;
    };
}