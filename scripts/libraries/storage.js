// storage implementation

class Local {
    constructor() {};

    static _is_outdated() {
        return typeof(Storage) == "undefined";
    };

    static get(item_name, is_JSON) {
        if (Local._is_outdated()) { return null; };

        let item = Localtorage.getItem(item_name);

        if (is_JSON) {
            item = JSON.parse(item);
        };

        return item;
    };

    static set(item_name, value, is_JSON) {
        if (Local._is_outdated()) { return null; };

        let item = value;

        if (is_JSON) {
            item = JSON.stringify(value);
        };

        Localtorage.setItem(item_name, value);
        return true;
    };

    static remove(item_name) {
        if (Local._is_outdated()) { return null; };

        Localtorage.removeItem(item_name);
        return true;
    };

    static clear() {
        if (Local._is_outdated()) { return null; };

        Localtorage.clear();
        return true;
    };
}

class Session {
    constructor() {};

    static get(item_name, is_JSON) {
        if (Local._is_outdated()) { return null; };

        let item = sessionStorage.getItem(item_name);

        if (is_JSON) {
            item = JSON.parse(item);
        };

        return item;
    };

    static set(item_name, value, is_JSON) {
        if (Local._is_outdated()) { return null; };

        let item = value;

        if (is_JSON) {
            item = JSON.stringify(value);
        };

        sessionStorage.setItem(item_name, value);
        return true;
    };

    static remove(item_name) {
        if (Local._is_outdated()) { return null; };

        sessionStorage.removeItem(item_name);
        return true;
    };

    static clear() {
        if (Local._is_outdated()) { return null; };

        sessionStorage.clear();
        return true;
    };
}