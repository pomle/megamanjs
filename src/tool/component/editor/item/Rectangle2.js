"use strict";

Editor.Item.Rectangle2 = function(object, node, bounds)
{
    let vec1 = new THREE.Vector2(bounds.x - bounds.w / 2, bounds.y - bounds.h / 2),
        vec2 = new THREE.Vector2(bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);

    Editor.Item.Rectangle.call(this, object, node, vec1, vec2);
}

Editor.Item.Rectangle2.prototype = Object.create(Editor.Item.Rectangle.prototype);
Editor.Item.Rectangle2.prototype.constructor = Editor.Item.Rectangle2;

Editor.Item.Rectangle2.prototype.updateNode = function()
{
    let p = this.model.position,
        v = this.vectors,
        n = this.node;

    n.attr({
        "x": this.round(p.x),
        "y": this.round(p.y),
        "w": this.round(v[1].x - v[0].x),
        "h": this.round(v[1].y - v[0].y),
    });
}
