Engine.Trait = function()
{
    this.object = undefined;

    for (var method of this.MAGIC_METHODS.keys()) {
        if (this[method]) {
            this[method] = this[method].bind(this);
        }
    }
}

Engine.traits = {};

Engine.Trait.prototype.MAGIC_METHODS = new Map();
Engine.Trait.prototype.MAGIC_METHODS.set('__collides',   Engine.Object.prototype.EVENT_COLLIDE);
Engine.Trait.prototype.MAGIC_METHODS.set('__obstruct',   Engine.Object.prototype.EVENT_OBSTRUCT);
Engine.Trait.prototype.MAGIC_METHODS.set('__uncollides', Engine.Object.prototype.EVENT_UNCOLLIDE);
Engine.Trait.prototype.MAGIC_METHODS.set('__timeshift',  Engine.Object.prototype.EVENT_TIMESHIFT);

Engine.Trait.prototype.NAME = undefined;

Engine.Trait.prototype.__attach = function(object)
{
    if (object instanceof Engine.Object === false) {
        throw new TypeError('Invalid object');
    }

    if (this.object) {
        this.__detach();
    }

    for (var method of this.MAGIC_METHODS.keys()) {
        if (this[method]) {
            object.bind(this.MAGIC_METHODS.get(method),
                        this[method]);
        }
    }

    this.object = object;
}

Engine.Trait.prototype.__detach = function()
{
    for (var method of this.MAGIC_METHODS.keys()) {
        this.object.unbind(this.MAGIC_METHODS.get(method),
                           this[method]);
    }
    this.object = undefined;
}

Engine.Trait.prototype.__collides = undefined;
Engine.Trait.prototype.__obstruct = undefined;
Engine.Trait.prototype.__uncollides = undefined;
Engine.Trait.prototype.__timeshift = undefined;
