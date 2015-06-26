Engine.Keyboard = function()
{
    this.bindings = {
        'down': {},
        'up': {}
    };
    this.keystate = {};
}

Engine.Keyboard.prototype.disable = function()
{
    window.removeEventListener('keydown', this.keyDownEvent.bind(this));
    window.removeEventListener('keyup', this.keyUpEvent.bind(this));
}

Engine.Keyboard.prototype.enable = function()
{
    window.addEventListener('keydown', this.keyDownEvent.bind(this));
    window.addEventListener('keyup', this.keyUpEvent.bind(this));
}

Engine.Keyboard.prototype.hit = function(code, callback)
{
    this.bindings.down[code] = callback;
}

Engine.Keyboard.prototype.intermittent = function(code, downCallback, upCallback)
{
    this.bindings.down[code] = downCallback;
    this.bindings.up[code] = upCallback;
}

Engine.Keyboard.prototype.keyDownEvent = function(event)
{
    var k = event.keyCode;
    if (this.keystate[k]) {
        return;
    }
    console.log('Key Down: %d', k);
    this.keystate[k] = new Date();
    if (this.bindings.down[k]) {
        this.bindings.down[k](event);
    }
}

Engine.Keyboard.prototype.keyUpEvent = function(event)
{
    var k = event.keyCode;
    if (!this.keystate[k]) {
        return;
    }
    var start = this.keystate[k];
    var stop = new Date();
    var duration = (stop.getTime() - start.getTime()) / 1000;;
    console.log('Key Up: %d, %f', k, duration);
    delete this.keystate[k];
    if (this.bindings.up[k]) {
        this.bindings.up[k](event, duration);
    }
}
