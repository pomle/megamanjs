const Entity = require('./Object');
const Events = require('./Events');

const MAGIC_METHODS = {
    '__collides': Entity.prototype.EVENT_COLLIDE,
    '__obstruct': Entity.prototype.EVENT_OBSTRUCT,
    '__uncollides': Entity.prototype.EVENT_UNCOLLIDE,
    '__timeshift': Entity.prototype.EVENT_TIMESHIFT,
};

class Trait
{
    constructor()
    {
        this.NAME = null;

        this._bindables = {};
        this._enabled = true;
        this._host = null;
        this._requires = [];

        this.EVENT_ATTACHED = 'attached';
        this.EVENT_DETACHED = 'detached';

        this.events = new Events(this);

        /* Bind on instantiation so that
           they can be found when unbound. */
        Object.keys(MAGIC_METHODS).forEach(method => {
            if (this[method]) {
                this[method] = this[method].bind(this);
                this._bindables[method] = this[method];
            }
        });
    }
    __attach(host)
    {
        if (this._host !== null) {
            throw new Error('Already attached');
        }

        if (host instanceof Entity !== true) {
            throw new TypeError('Invalid host');
        }

        this._requires.forEach(ref => {
            this.__require(host, ref);
        });

        this._host = host;

        const events = this._host.events;
        Object.keys(this._bindables).forEach(method => {
            events.bind(MAGIC_METHODS[method], this[method]);
        });

        this.events.trigger(this.EVENT_ATTACHED, [this._host]);
    }
    __detach()
    {
        const events = this._host.events;
        Object.keys(this._bindables).forEach(method => {
            events.unbind(MAGIC_METHODS[method], this[method]);
        });

        this.events.trigger(this.EVENT_DETACHED, [this._host]);
        this._host = null;
    }
    __require(host, traitReference)
    {
        const trait = host.getTrait(traitReference);
        if (trait !== false) {
            return trait;
        }
        throw new Error('Required trait "' + new traitReference().NAME + '" not found');
    }
    __requires(traitReference)
    {
        this._requires.push(traitReference);
    }
    _bind(name, callback)
    {
        this._host.events.bind(name, callback);
    }
    _trigger(name, values)
    {
        this._host.events.trigger(name, values);
    }
    _unbind(name, callback)
    {
        this._host.events.unbind(name, callback);
    }
    disable()
    {
        this._enabled = false;
    }
    enable()
    {
        this._enabled = true;
    }
}

module.exports = Trait;
