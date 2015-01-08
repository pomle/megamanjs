Engine.Keyboard = function()
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
        console.log('Key Down: %d', k);
        self.keystate[k] = new Date();
        if (self.bindings.down[k]) {
            self.bindings.down[k](event);
        }
    });

    window.addEventListener('keyup', function(event)
    {
        var k = event.keyCode;
        var start = self.keystate[k];
        var stop = new Date();
        var duration = (stop.getTime() - start.getTime()) / 1000;;
        console.log('Key Up: %d, %f', k, duration);
        delete self.keystate[k];
        if (self.bindings.up[k]) {
            self.bindings.up[k](event, duration);
        }
    });
}
