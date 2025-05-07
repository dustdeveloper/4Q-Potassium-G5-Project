class Input {
    constructor() {
        this.keyDown = new Signal();
        this.keyUp = new Signal();  
        this.activeKeys = new Set();

        // Bind event listeners
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);

        // Attach event listeners
        document.addEventListener("keydown", this._onKeyDown);
        document.addEventListener("keyup", this._onKeyUp);
    }

    _onKeyDown(event) {
        if (!this.activeKeys.has(event.key)) {
            this.activeKeys.add(event.key);
            this.keyDown.fire(event.key);
        }
    }

    _onKeyUp(event) {
        if (this.activeKeys.has(event.key)) {
            this.activeKeys.delete(event.key);
            this.keyUp.fire(event.key);
        }
    }

    destroy() {
        document.removeEventListener("keydown", this._onKeyDown);
        document.removeEventListener("keyup", this._onKeyUp);
        this.keyDown.destroy();
        this.keyUp.destroy();
    }
}