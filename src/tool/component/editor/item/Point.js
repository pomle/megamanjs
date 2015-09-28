"use strict";

Editor.Item.Point = function(object, node, vec)
{
    Editor.Item.call(this, object, node);

    this.point = vec;
}

Editor.Item.Point.prototype = Object.create(Editor.Item.prototype);
Editor.Item.Point.prototype.constructor = Editor.Item.Point;

Editor.Item.Point.prototype.getComponent = function(name)
{
    switch (name) {
        case 'x':
        case 'y':
        case 'z':
            return this.point[name];
            break;
    }
}

Editor.Item.Point.prototype.setComponent = function(name, value)
{
    let k = name,
        v = value,
        n = this.node;

    this.propagateComponent(name, value);

    switch (k) {
        case 'x':
        case 'y':
        case 'z':
            this.point[name] = value;
            n.attr(name, v);
            return;
            break;
    }
}
