"use strict";

Editor.Item = function(object, node)
{
    this.object = object;
    this.node = $(node);
    this.type = undefined;
}

Editor.Item.prototype.attributeMap = {
    x: 'x',
    y: 'y',
    z: 'z',
}

Object.defineProperties(Editor.Item.prototype, {
    h: {
        get: function() {
            return this.getComponent('h');
        },
        set: function(v) {
            this.setComponent('h', v);
        },
    },
    w: {
        get: function() {
            return this.getComponent('w');
        },
        set: function(v) {
            this.setComponent('w', v);
        },
    },
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
    let k = name,
        v = value,
        o = this.object,
        p = o.position,
        n = this.node;

    switch (k) {
        case 'x':
            p.x = v;
            console.log(v, o.origo.x);
            n.attr('x', v + o.origo.x);
            break;

        case 'y':
            p.y = v;
            n.attr('y', -(v + o.origo.y));
            break;

        case 'z':
            p.z = v;
            n.attr('z', v);
            break;
    }

    //o.model.updateMatrix();
}
