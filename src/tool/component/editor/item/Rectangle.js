"use strict";

Editor.Item.Rectangle = function(object, node)
{
    Editor.Item.call(this, object, node);

    var x1 = parseFloat(node.attr('x1')),
        x2 = parseFloat(node.attr('x2')),
        y1 = parseFloat(node.attr('y1')),
        y2 = parseFloat(node.attr('y2')),
        w = Math.abs(x1 - x2),
        h = Math.abs(y1 - y2);

    this.prop = {
        x: x1 + w / 2,
        y: y1 + h / 2,
        w: w,
        h: h,
    }
}

Editor.Item.Rectangle.prototype = Object.create(Editor.Item.prototype);
Editor.Item.Rectangle.prototype.constructor = Editor.Item.Rectangle;

Editor.Item.Rectangle.prototype.getComponent = function(name)
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

Editor.Item.Rectangle.prototype.setComponent = function(name, value)
{
    let k = name,
        v = value,
        o = this.object,
        p = o.position,
        g = o.model.geometry,
        n = this.node;

    switch (k) {
        case 'w':
            this.prop.w = v;
            v /= 2;
            g.vertices[0].x = -v;
            g.vertices[1].x = v;
            g.vertices[2].x = -v;
            g.vertices[3].x = v;
            g.verticesNeedUpdate = true;
            n.attr('x1', p.x - v);
            n.attr('x2', p.x + v);
            break;

        case 'h':
            this.prop.h = v;
            v /= 2;
            g.vertices[0].y = -v;
            g.vertices[1].y = v;
            g.vertices[2].y = -v;
            g.vertices[3].y = v;
            g.verticesNeedUpdate = true;
            n.attr('y1', p.y - v);
            n.attr('y2', p.y + v);
            break;

        case 'x':
            p.x = v;
            n.attr('x1', v - this.prop.w / 2);
            n.attr('x2', v + this.prop.w / 2);
            break;

        case 'y':
            p.y = v;
            n.attr('y1', v - this.prop.h / 2);
            n.attr('y2', v + this.prop.h / 2);
            break;
    }
}
