class Events
{
    constructor(host)
    {
        this._host = host;
        this._events = {};
    }
    _gc(name)
    {
        const events = this._events[name];
        for (let i = 0, l = events.length; i < l; ++i) {
            if (events[i] === undefined) {
                events.splice(i, 1);
                --i;
                --l;
            }
        }
    }
    bind(name, callback)
    {
        if (typeof name !== 'string') {
            throw new TypeError('Event name must be string');
        }
        if (this.bound(name, callback)) {
            return;
        }
        if (!this._events[name]) {
            this._events[name] = [];
        }
        this._events[name].push(callback);
        this._gc(name);
    }
    bound(name, callback)
    {
        return this._events[name] !== undefined &&
               this._events[name].indexOf(callback) !== -1;
    }
    clear()
    {
        this._events = {};
    }
    once(name, callback)
    {
        const events = this;
        events.bind(name, function wrapper() {
            events.unbind(name, wrapper);
            callback.apply(this, arguments);
        });
    }
    trigger(name, values)
    {
        if (this._events[name]) {
            const events = this._events[name];
            const host = this._host;
            /* Notice that this method expects to
               get the arguments to be passed as an
               array as second argument. */
            for (let i = 0, l = events.length; i !== l; ++i) {
                if (events[i] !== undefined) {
                    events[i].apply(host, values);
                }
            }
        }
    }
    unbind(name, callback)
    {
        if (this._events[name]) {
            const events = this._events[name];
            const index = events.indexOf(callback);
            if (index !== -1) {
                events[index] = undefined;
            }
        }
    }
}

module.exports = Events;
