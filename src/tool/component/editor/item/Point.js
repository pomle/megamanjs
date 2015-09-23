"use strict";

Editor.Item.Point = function(object, node, vec)
{
    Editor.Item.call(this, object, node);

    this.point = vec;
}

Editor.Item.Point.prototype = Object.create(Editor.Item.prototype);
Editor.Item.Point.prototype.constructor = Editor.Item.Point;

Editor.Item.Point.prototype.setComponent = function(name, value)
{
    switch (name) {
        case 'x':
        case 'y':
            this.point[name] = value;
            break;
    }

    Editor.Item.prototype.setComponent.call(this, name, value);
}
