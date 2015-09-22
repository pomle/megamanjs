"use strict";

Editor.Item = function(object, node)
{
    this.children = [];
    this.object = object;
    this.node = $(node);
    this.type = undefined;
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

Editor.Item.prototype.addChild = function(child)
{
    this.children.push(child);
}

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

Editor.Item.prototype.propagateComponent = function(name, value)
{
    if (this.children.length !== 0) {
        for (let i = 0, l = this.children.length; i !== l; ++i) {
            this.children[i][name] += value - this[name];
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

    this.propagateComponent(name, value);

    switch (k) {
        case 'x':
            p.x = v;
            n.attr('x', v + o.origo.x);
            return;
            break;

        case 'y':
            p.y = v;
            n.attr('y', -(v + o.origo.y));
            return;
            break;

        case 'z':
            p.z = v;
            n.attr('z', v);
            return;
            break;
    }
    //o.model.updateMatrix();
}
