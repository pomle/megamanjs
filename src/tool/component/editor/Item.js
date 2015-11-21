"use strict";

Editor.Item = function(object, node)
{
    this.children = [];
    this.object = object;
    this.node = $(node);
}

Editor.Item.PRECISION = 4;

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
    var clone = new this.constructor(new this.object.constructor(), node);
    for (let prop of ['x','y','z','w','h']) {
        if (this[prop] !== undefined) {
            clone[prop] = this[prop];
        }
    }
    return clone;
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

Editor.Item.prototype.delete = function()
{

}
