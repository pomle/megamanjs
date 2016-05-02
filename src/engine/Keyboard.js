'use strict';

Engine.Keyboard = class Keyboard {
    constructor()
    {
        this.LEFT = 'left';
        this.RIGHT = 'right';
        this.UP = 'up';
        this.DOWN = 'down';
        this.A = 'a';
        this.B = 'b';
        this.SELECT = 'select';
        this.START = 'start';

        this.ENGAGE = 'keydown';
        this.RELEASE = 'keyup';

        this.events = new Engine.Events();

        this.map = {
            65: this.LEFT,
            68: this.RIGHT,
            87: this.UP,
            83: this.DOWN,
            80: this.A,
            79: this.B,
            81: this.SELECT,
            69: this.START,
        };

        this.state = {};
    }
    assign(code, name)
    {
        this.map[code] = name;
    }
    hit(key, engage)
    {
        this.events.bind(key + '_' + this.ENGAGE, engage);
    }
    intermittent(key, engage, release)
    {
        this.events.bind(key + '_' + this.ENGAGE, engage);
        this.events.bind(key + '_' + this.RELEASE, release);
    }
    release()
    {
        for (var key in this.map) {
            this.trigger(this.map[key], this.RELEASE);
        }
    }
    trigger(key, state)
    {
        if (this.state[key] === state) {
            return false;
        }

        this.state[key] = state;
        this.events.trigger(key + '_' + state);

        return true;
    }
    triggerEvent(event)
    {
        var code = event.keyCode;
        if (this.map[code]) {
            if (event.preventDefault) {
                event.preventDefault();
            }
            this.trigger(this.map[code], event.type);
        }
    }
    unassign(code)
    {
        delete this.map[code];
    }
}
