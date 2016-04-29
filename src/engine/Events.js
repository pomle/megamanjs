'use strict';

Engine.Events = class Events {
    constructor(host)
    {
        this.host = host;
        this.events = {};
    }
    bind(name, callback)
    {
        if (typeof name !== 'string') {
            throw new TypeError('Event name must be string');
        }
        if (!this.events[name]) {
            this.events[name] = [];
        }
        this.events[name].push(callback);
        this.gc(name);
    }
    gc(name)
    {
        if (this.events[name]) {
            const events = this.events[name];
            for (let i = 0, l = events.length; i < l; ++i) {
                if (events[i] === undefined) {
                    events.splice(i, 1);
                    --i;
                    --l;
                }
            }
        }
    }
    bound(name, callback)
    {
        return this.events[name] !== undefined &&
               this.events[name].indexOf(callback) !== -1;
    }
    trigger(name, values)
    {
        if (this.events[name]) {
            const events = this.events[name];
            const host = this.host;
            /* Notice that this method expects to
               get the arguments to be passed as an
               array as second argument. */
            for (let i = 0, l = events.length; i < l; ++i) {
                if (events[i] !== undefined) {
                    events[i].apply(host, values);
                }
            }
        }
    }
    unbind(name, callback)
    {
        if (this.events[name]) {
            const events = this.events[name];
            const index = events.indexOf(callback);
            if (index !== -1) {
                events[index] = undefined;
            }
        }
    }
}
