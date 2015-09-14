"use strict";

Editor.Item = function(object, node)
{
    this.object = object;
    this.node = $(node);
    this.type = undefined;
}

Object.defineProperties(Editor.Item.prototype, {
    x: {
        get: function() {
            return this.getComponent('x');
        },
        set: function(v) {
            this.setComponent('x', v);
        },
    },
    y: {
        get: function() {
            return this.getComponent('y');
        },
        set: function(v) {
            this.setComponent('y', v);
        },
    },
    z: {
        get: function() {
            return this.getComponent('z');
        },
        set: function(v) {
            this.setComponent('z', v);
        },
    },
});

Editor.Item.prototype.clone = function()
{
    var node = this.node.clone();
    node.insertAfter(this.node);
    return new this.constructor(new this.object.constructor(), node);
}

Editor.Item.prototype.getComponent = function(name)
{
    var o = this.object;

    switch (name) {
        case 'x':
        case 'y':
        case 'z':
            return o.position[name];
            break;
    }
}

Editor.Item.prototype.moveTo = function(vec)
{
    let components = ['x', 'y', 'z'];
    for (let c of components) {
        if (vec[c] !== undefined) {
            this.setComponent(c, vec[c]);
        }
    }
}

Editor.Item.prototype.setComponent = function(name, value)
{
    var k = name,
        v = value,
        o = this.object,
        n = this.node;

    switch (k) {
        case 'x':
            o.position.x = v;
            n.attr('x', v + o.origo.x);
            break;

        case 'y':
            o.position.y = v;
            n.attr('y', -(v + o.origo.y));
            break;

        case 'z':
            o.position.z = v;
            n.attr('z', v);
            break;
    }

    o.model.updateMatrix();
}
