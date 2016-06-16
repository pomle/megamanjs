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
    const n = this.node;
    Object.keys(this.point).forEach(key => {
        if (this.point[key] == null) {
            n.attr(key, null);
        } else {
            n.attr(key, this.round(this.point[key]));
        }
    });
}

Editor.Item.Point.prototype.update = function()
{
    this.model.position.copy(this.point);
    this.updateNode();
}
