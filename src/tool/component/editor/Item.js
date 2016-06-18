"use strict";

Editor.Item = function(object, node)
{
    this.children = [];
    this.object = object;
    this.node = $(node);
    this.round = function(v) {
        if (typeof v !== 'number') {
            return undefined;
        }
        return Engine.Math.round(v, Editor.Item.PRECISION);
    }
}

Editor.Item.PRECISION = 4;
Editor.Item.prototype.MATERIAL = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
});

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
    position: {
        get: function() {
            return this.model.position;
        },
    },
    scale: {
        get: function() {
            return this.getComponent('scale');
        },
        set: function(v) {
            this.setComponent('scale', v);
        },
    },
});

Editor.Item.prototype.addChild = function(child)
{
    this.children.push(child);
}

Editor.Item.prototype.clone = function()
{
    const node = this.node.clone();
    node.insertAfter(this.node);
    const clone = new this.constructor(new this.object.constructor(), node);
    ['x','y','z','w','h'].forEach(p => {
        if (this[p] != null) {
            clone[p] = this[p];
        }
    });
    return clone;
}

Editor.Item.prototype.moveTo = function(vec)
{
    ['x','y','z'].forEach(c => {
        if (vec[c] != null) {
            this.setComponent(c, vec[c]);
        }
    });
}

Editor.Item.prototype.nudge = function(vec)
{
    const pos = this.position.clone().add(vec);
    return this.moveTo(pos);
}

Editor.Item.prototype.propagateComponent = function(key, value)
{
    this.children.forEach(child => {
        child[key] += value - this[key];
    });
}

Editor.Item.prototype.delete = function()
{
    console.warn('Implicit delete');
}
