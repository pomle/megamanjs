Engine.Events = function()
{
    this.events = {};
}

Engine.Events.prototype.bind = function(name, callback)
{
    if (typeof name !== 'string') {
        throw new TypeError("Event name must be string, got " + name);
    }

    if (!this.events[name]) {
        this.events[name] = [];
    }
    this.events[name].push(callback);
}

Engine.Events.prototype.trigger = function(name, values)
{
    if (this.events[name]) {
        var events = this.events[name];
        /* Notice that this method expects to
           get the arguments to be passed as an
           array as second argument. */
        for (var i = 0, l = events.length; i < l; ++i) {
            events[i].apply(this, values);
        }
        return true;
    }
    return false;
}

Engine.Events.prototype.unbind = function(name, callback)
{
    if (this.events[name]) {
        var events = this.events[name];
        var i = events.indexOf(callback);
        if (i !== -1) {
            events.splice(i, 1);
            return true;
        }
    }
    return false;
}
