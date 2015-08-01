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
        this.events[name] = new Set();
    }
    this.events[name].add(callback);
}

Engine.Events.prototype.trigger = function(name, values)
{
    if (this.events[name]) {
        /* Notice that this method expects to
           get the arguments to be passed as an
           array as second argument. */
        for (var event of this.events[name]) {
            events[i].apply(this, values);
        }
        return true;
    }
    return false;
}

Engine.Events.prototype.unbind = function(name, callback)
{
    if (this.events[name]) {
        return this.events[name].delete(callback);
    }
    return false;
}
