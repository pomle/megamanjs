KeyboardHelper = function()
{
    this.enabled = true;
    this.bindings = {
        'down': {},
        'up': {}
    };
    this.keystate = {};

    window.addEventListener('keydown', this.keyDownEvent.bind(this));
    window.addEventListener('keyup', this.keyUpEvent.bind(this));
}

KeyboardHelper.prototype.hit = function(code, callback)
{
    this.bindings.down[code] = callback;
}

KeyboardHelper.prototype.intermittent = function(code, downCallback, upCallback)
{
    this.bindings.down[code] = downCallback;
    this.bindings.up[code] = upCallback;
}

KeyboardHelper.prototype.keyDownEvent = function(event)
{
    if (!this.enabled) {
        return;
    }

    var k = event.keyCode;
    if (this.keystate[k]) {
        event.preventDefault();
        return;
    }
    console.log('Key Down: %d', k);
    this.keystate[k] = new Date();
    if (this.bindings.down[k]) {
        event.preventDefault();
        this.bindings.down[k](event);
    }
}

KeyboardHelper.prototype.keyUpEvent = function(event)
{
    if (!this.enabled) {
        return;
    }

    var k = event.keyCode;
    var start = this.keystate[k];
    var stop = new Date();
    var duration = (stop.getTime() - start.getTime()) / 1000;;
    console.log('Key Up: %d, %f', k, duration);
    delete this.keystate[k];
    if (this.bindings.up[k]) {
        event.preventDefault();
        this.bindings.up[k](event, duration);
    }
}
