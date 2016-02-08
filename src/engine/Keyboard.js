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

Engine.Keyboard.prototype.triggerEvent = function(event)
{
    var key = event.keyCode;
    if (this.map[key]) {
        var keyName = this.map[key],
            eventName = keyName + '_' + event.type;

        if (this.state[keyName] === event.type) {
            return false;
        }

        this.state[keyName] = event.type;
        this.events.trigger(eventName);

        return true;
    }
}

Engine.Keyboard.prototype.hit = function(code, callback)
{
    this.events.bind(code + '_keydown', callback);
}

Engine.Keyboard.prototype.intermittent = function(code, downCallback, upCallback)
{
    this.events.bind(code + '_keydown', downCallback);
    this.events.bind(code + '_keyup', upCallback);
}

Engine.Keyboard.prototype.release = function()
{
    for (var key in this.map) {
        this.triggerEvent({keyCode: key, type: 'keyup'});
    }
}
