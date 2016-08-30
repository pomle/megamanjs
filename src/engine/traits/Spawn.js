'use strict';

Engine.traits.Spawn = function()
{
    Engine.Trait.call(this);
    this._conditions = [];

    this._bind = this._bind.bind(this);
    this._unbind = this._unbind.bind(this);
}

Engine.Util.extend(Engine.traits.Spawn, Engine.Trait, {
    NAME: 'spawn',
    __attach: function() {
        Engine.Trait.prototype.__attach.apply(this, arguments);
        this._conditions.forEach(this._bind);
    },
    __detach: function() {
        this._conditions.forEach(this._unbind);
        Engine.Trait.prototype.__detach.apply(this, arguments);
    },
    _bind: function(condition) {
        this._host.events.bind(condition.event, condition.callback);
    },
    _unbind: function(condition) {
        this._host.events.unbind(condition.event, condition.callback);
    },
    addItem: function(event, constr, offset) {
        offset = offset || new THREE.Vector3(0, 0, 0);
        this._conditions.push({
            event: event,
            callback: function() {
                var object = new constr();
                object.position.copy(this.position);
                object.position.add(offset);
                this.world.addObject(object);
            },
        });
    },
});
