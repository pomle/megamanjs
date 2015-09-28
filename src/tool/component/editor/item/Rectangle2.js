"use strict";

Editor.Item.Rectangle2 = function(object, node)
{
    let pos = object.position,
        vert = object.geometry.vertices,
        vec1 = new THREE.Vector2(pos.x + vert[0].x, pos.y - vert[0].y),
        vec2 = new THREE.Vector2(pos.x + vert[3].x, pos.y - vert[3].y);

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
        "x": p.x,
        "y": p.y,
        "w": v[1].x - v[0].x,
        "h": v[1].y - v[0].y,
    });
}
