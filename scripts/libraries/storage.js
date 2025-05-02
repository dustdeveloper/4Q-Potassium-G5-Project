// storage implementation

class Local {
    constructor() {};

    static _is_outdated() {
        return typeof(Storage) == "undefined";
    };

    static get(item_name, is_JSON = false) {
        if (Local._is_outdated()) { return null; };

        let item = localStorage.getItem(item_name);

        if (is_JSON) {
            item = JSON.parse(item);
        };

        return item;
    };

    static set(item_name, value, is_JSON = false) {
        if (Local._is_outdated()) { return null; };

        let item = value;
        
        if (is_JSON) {
            item = JSON.stringify(value);
        };

        localStorage.setItem(item_name, item);
        return true;
    };

    static remove(item_name) {
        if (Local._is_outdated()) { return null; };

        localStorage.removeItem(item_name);
        return true;
    };

    static clear() {
        if (Local._is_outdated()) { return null; };

        localStorage.clear();
        return true;
    };
}

class Session {
    constructor() {};

    static get(item_name, is_JSON = false) {
        if (Local._is_outdated()) { return null; };

        let item = sessionStorage.getItem(item_name);

        if (is_JSON) {
            item = JSON.parse(item);
        };

        return item;
    };

    static set(item_name, value, is_JSON = false) {
        if (Local._is_outdated()) { return null; };

        if (is_JSON) {
            value = JSON.stringify(value);
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

class Cookie {
    constructor() {};

    static get(item_name) {
        const cookies = document.cookie.split("; ");
        for (let cookie of cookies) {
            const [key, value] = cookie.split("=");
            if (key === item_name) {
                return decodeURIComponent(value);
            }
        }
        return null;
    };

    static set(item_name, value, days = 7) {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${item_name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
        return true;
    };

    static remove(item_name) {
        // Set the cookie with an expired date to remove it
        document.cookie = `${item_name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
        return true;
    };

    static clear() {
        const cookies = document.cookie.split("; ");
        for (let cookie of cookies) {
            const [key] = cookie.split("=");
            this.remove(key);
        }
        return true;
    };
}