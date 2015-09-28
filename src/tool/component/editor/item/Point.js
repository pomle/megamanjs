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
    return this.point[name];
}

Editor.Item.Point.prototype.setComponent = function(name, value)
{
    let k = name,
        v = value,
        n = this.node;

    this.propagateComponent(name, value);

    this.point[name] = value;

    this.update();
}

Editor.Item.Point.prototype.updateNode = function()
{
    let n = this.node;
    n.attr({
        'x': this.point.x,
        'y': this.point.y,
        'z': this.point.z,
    });
}

Editor.Item.Point.prototype.update = function()
{
    this.model.position.copy(this.point);
    this.updateNode();
}
