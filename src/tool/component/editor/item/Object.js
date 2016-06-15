"use strict";

Editor.Item.Object = function(object, node, sourceNode)
{
    Editor.Item.call(this, object, node);
    this.model = object.model;
    this.sourceNode = sourceNode;
}

Editor.Item.Object.prototype = Object.create(Editor.Item.prototype);
Editor.Item.Object.prototype.constructor = Editor.Item.Object;

Editor.Item.Object.prototype.TYPE = 'object';

Editor.Item.Object.prototype.getComponent = function(name)
{
    let o = this.object;

    if (name === 'x' || name === 'y' || name === 'z') {
        return o.position[name];
    }
    else if (name === 'w' || name === 'h') {
        let v = o.geometry.vertices,
            s = [new THREE.Vector2(), new THREE.Vector2()];
        for (let i = 0, l = v.length; i !== l; ++i) {
            let d = v[i];
            s[0].x = Math.min(d.x, s[0].x);
            s[1].x = Math.max(d.x, s[1].x);
            s[0].y = Math.min(d.y, s[0].y);
            s[1].y = Math.max(d.y, s[1].y);
        }
        if (name === 'w') {
            return s[1].x - s[0].x;
        }
        else if (name === 'h') {
            return s[1].y - s[0].y;
        }
    }
    else if (name === 'scale') {
        return this.model.scale.x;
    }
}

Editor.Item.Object.prototype.setComponent = function(name, value)
{
    let k = name,
        v = this.round(value),
        o = this.object,
        p = o.position,
        s = this.model.scale,
        n = this.node;

    this.propagateComponent(name, value);

    switch (k) {
        case 'x':
            p.x = v;
            n.attr('x', v);
            break;

        case 'y':
            p.y = v;
            n.attr('y', v);
            break;

        case 'z':
            p.z = v;
            n.attr('z', v);
            break;

        case 'scale':
            s.set(v, v, v);
            n.attr('scale', v === 1 ? null : v);
            break;
    }
}
