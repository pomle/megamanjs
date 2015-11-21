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
    this.propagateComponent(name, value);
    this.point[name] = this.round(value);
    this.update();
}

Editor.Item.Point.prototype.updateNode = function()
{
    let n = this.node;

    n.attr({
        'x': this.round(this.point.x),
        'y': this.round(this.point.y),
        'z': this.round(this.point.z),
    });
}

Editor.Item.Point.prototype.update = function()
{
    this.model.position.copy(this.point);
    this.updateNode();
}
