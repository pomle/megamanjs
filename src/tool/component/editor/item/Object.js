"use strict";

Editor.Item.Object = function(object, node)
{
    Editor.Item.call(this, object, node);
    this.model = object.model;
}

Editor.Item.Object.prototype = Object.create(Editor.Item.prototype);
Editor.Item.Object.prototype.constructor = Editor.Item.Object;

Editor.Item.Object.prototype.TYPE = 'object';

Editor.Item.Object.prototype.getComponent = function(name)
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

Editor.Item.Object.prototype.setComponent = function(name, value)
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
}
