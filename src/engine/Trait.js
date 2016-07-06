Engine.Trait = function()
{
    this._bound = false;
    this._bindables = {};
    this._enabled = true;
    this._host = undefined;

    this.EVENT_ATTACHED = 'attached';
    this.EVENT_DETACHED = 'detached';

    this.events = new Engine.Events(this);

    /* Bind on instanciation so that
       they can be found when unbound. */
    for (var method in this.MAGIC_METHODS) {
        if (this[method] !== undefined) {
            this[method] = this[method].bind(this);
            this._bindables[method] = this[method];
        }
    }
}

Engine.Trait.prototype.MAGIC_METHODS = {
    '__collides':   Engine.Object.prototype.EVENT_COLLIDE,
    '__obstruct':   Engine.Object.prototype.EVENT_OBSTRUCT,
    '__uncollides': Engine.Object.prototype.EVENT_UNCOLLIDE,
    '__timeshift':  Engine.Object.prototype.EVENT_TIMESHIFT,
}

Engine.Trait.prototype.NAME = undefined;

Engine.Trait.prototype.__attach = function(host)
{
    if (host instanceof Engine.Object === false) {
        throw new TypeError('Invalid host');
    }
    if (this._host !== undefined) {
        throw new Error('Already attached');
    }
    this._host = host;
    this.__on();
    this.events.trigger(this.EVENT_ATTACHED, [this._host]);
}

Engine.Trait.prototype.__detach = function()
{
    this.__off();
    this.events.trigger(this.EVENT_DETACHED, [this._host]);;
    this._host = undefined;
}

Engine.Trait.prototype.__require = function(host, traitReference)
{
    var trait = host.getTrait(traitReference);
    if (trait !== false) {
        return trait;
    }
    throw new Error('Required trait "' + new traitReference().NAME + '" not found');
}

Engine.Trait.prototype.__collides = undefined;
Engine.Trait.prototype.__obstruct = undefined;
Engine.Trait.prototype.__uncollides = undefined;
Engine.Trait.prototype.__timeshift = undefined;

Engine.Trait.prototype.__off = function()
{
    if (this._bound === true) {
        var events = this._host.events;
        for (var method in this._bindables) {
            events.unbind(this.MAGIC_METHODS[method], this[method]);
        }
        this._bound = false;
    }
}

Engine.Trait.prototype.__on = function()
{
    if (this._bound === false) {
        var events = this._host.events;
        for (var method in this._bindables) {
            events.bind(this.MAGIC_METHODS[method], this[method]);
        }
        this._bound = true;
    }
}

Engine.Trait.prototype._bind = function(name, callback)
{
    this._host.events.bind(name, callback);
}

Engine.Trait.prototype._trigger = function(name, values)
{
    this._host.events.trigger(name, values);
}

Engine.Trait.prototype._unbind = function(name, callback)
{
    this._host.events.unbind(name, callback);
}

Engine.Trait.prototype.disable = function()
{
    this._enabled = false;
    this.__off();
}

Engine.Trait.prototype.enable = function()
{
    this._enabled = true;
    this.__on();
}
