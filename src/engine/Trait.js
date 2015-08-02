Engine.Trait = function()
{
    this.object = undefined;

    /* Bind on instanciation so that we
       they can be found when unbound. */
    for (var method in this.MAGIC_METHODS) {
        if (this[method]) {
            this[method] = this[method].bind(this);
        }
    }
}

Engine.traits = {};

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

    if (this.object) {
        this.__detach();
    }

    for (var method in this.MAGIC_METHODS) {
        if (this[method]) {
            object.bind(this.MAGIC_METHODS[method],
                        this[method]);
        }
    }

    this.object = object;
}

Engine.Trait.prototype.__detach = function()
{
    for (var method in this.MAGIC_METHODS) {
        this.object.unbind(this.MAGIC_METHODS[method],
                           this[method]);
    }
    this.object = undefined;
}

Engine.Trait.prototype.__collides = undefined;
Engine.Trait.prototype.__obstruct = undefined;
Engine.Trait.prototype.__uncollides = undefined;
Engine.Trait.prototype.__timeshift = undefined;
