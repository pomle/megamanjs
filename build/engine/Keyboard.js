var Keyboard = function()
{
    var self = this;
    self.bindings = {
        'down': {},
        'up': {}
    };
    self.keystate = {};

    self.hit = function(code, callback)
    {
        self.bindings.down[code] = callback;
    }

    self.intermittent = function(code, downCallback, upCallback)
    {
        self.bindings.down[code] = downCallback;
        self.bindings.up[code] = upCallback;
    }

    window.addEventListener('keydown', function(event)
    {
        var k = event.keyCode;
        if (self.keystate[k]) {
            return;
        }
        self.keystate[k] = new Date();
        if (self.bindings.down[k]) {
            self.bindings.down[k](event);
        }
    });

    window.addEventListener('keyup', function(event)
    {
        var k = event.keyCode;
        delete self.keystate[k];
        if (self.bindings.up[k]) {
            self.bindings.up[k](event);
        }
    });
}
