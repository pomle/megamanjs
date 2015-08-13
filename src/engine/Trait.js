Engine.Trait = function()
{
    this._host = undefined;

    /* Bind on instanciation so that we
       they can be found when unbound. */
    for (var method in this.MAGIC_METHODS) {
        if (this[method]) {
            this[method] = this[method].bind(this);
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

Engine.Trait.prototype.__attach = function(object)
{
    if (object instanceof Engine.Object === false) {
        throw new TypeError('Invalid object');
    }

    if (this._host) {
        this.__detach();
    }

    this._host = object;
    this.on();
}

Engine.Trait.prototype.__detach = function()
{
    this.off();
    this._host = undefined;
}

Engine.Trait.prototype.__require = function(host, traitReference)
{
    var trait = host.getTrait(traitReference);
    if (trait !== false) {
        return trait;
    }
    console.error("%s depends on %s which could not be found on %s", this, new traitReference(), host);
    throw new Error("Required trait not found");
}

Engine.Trait.prototype.__collides = undefined;
Engine.Trait.prototype.__obstruct = undefined;
Engine.Trait.prototype.__uncollides = undefined;
Engine.Trait.prototype.__timeshift = undefined;

Engine.Trait.prototype.off = function()
{
    var host = this._host;
    for (var method in this.MAGIC_METHODS) {
        if (this[method]) {
            host.unbind(this.MAGIC_METHODS[method],
                        this[method]);
        }
    }
}

Engine.Trait.prototype.on = function()
{
    var host = this._host;
    for (var method in this.MAGIC_METHODS) {
        if (this[method]) {
            host.bind(this.MAGIC_METHODS[method],
                      this[method]);
        }
    }
}
