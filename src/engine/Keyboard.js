Engine.Keyboard = function()
{
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

Engine.Keyboard.prototype.LEFT = 'left';
Engine.Keyboard.prototype.RIGHT = 'right';
Engine.Keyboard.prototype.UP = 'up';
Engine.Keyboard.prototype.DOWN = 'down';
Engine.Keyboard.prototype.A = 'a';
Engine.Keyboard.prototype.B = 'b';
Engine.Keyboard.prototype.SELECT = 'select';
Engine.Keyboard.prototype.START = 'start';

Engine.Keyboard.prototype.ENGAGE = 'keydown';
Engine.Keyboard.prototype.RELEASE = 'keyup';

Engine.Keyboard.prototype.hit = function(key, engage)
{
    this.events.bind(key + '_' + this.ENGAGE, engage);
}

Engine.Keyboard.prototype.intermittent = function(key, engage, release)
{
    this.events.bind(key + '_' + this.ENGAGE, engage);
    this.events.bind(key + '_' + this.RELEASE, release);
}

Engine.Keyboard.prototype.release = function()
{
    for (var key in this.map) {
        this.trigger(key, this.RELEASE);
    }
}

Engine.Keyboard.prototype.trigger = function(key, state)
{
    if (this.state[key] === state) {
        return false;
    }

    this.state[key] = state;
    this.events.trigger(key + '_' + state);

    return true;
}

Engine.Keyboard.prototype.triggerEvent = function(event)
{
    var key = event.keyCode;
    if (this.map[key]) {
        if (event.preventDefault) {
            event.preventDefault();
        }

        this.trigger(this.map[key], event.type);
    }
}
