// storage implementation

class StorageClass {
    constructor() {};

    static _is_outdated() {
        return typeof(Storage) == "undefined";
    };

    static get_local_item(item_name) {
        if (StorageClass._is_outdated()) { return null; };

        return localStorage.getItem(item_name);
    };

    static set_local_item(item_name, value) {
        if (StorageClass._is_outdated()) { return null; };

        localStorage.setItem(item_name, value);
        return true;
    };

    static remove_local_item(item_name) {
        if (StorageClass._is_outdated()) { return null; };

        localStorage.removeItem(item_name);
        return true;
    };

    static clear() {
        if (StorageClass._is_outdated()) { return null; };

        localStorage.clear();
        return true;
    };
}