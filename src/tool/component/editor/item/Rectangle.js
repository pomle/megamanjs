"use strict";

Editor.Item.Rectangle = function(object, node, vec1, vec2)
{
    Editor.Item.call(this, object, node);

    this.vectors = [vec1, vec2];

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
    let k = name,
        o = this.object,
        p = o.position,
        g = o.model.geometry,
        n = this.node;

    switch (name) {
        case 'x':
        case 'y':
        case 'z':
            return p[name];
            break;
        case 'w':
            return g.vertices[3].x - g.vertices[0].x;
        case 'h':
            return g.vertices[0].y - g.vertices[3].y;
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
            this.vectors[0].x = -v;
            this.vectors[1].x = v;
            g.vertices[0].x = -v;
            g.vertices[1].x = v;
            g.vertices[2].x = -v;
            g.vertices[3].x = v;
            this.recalcGeometry(g);
            n.attr('x1', p.x - v);
            n.attr('x2', p.x + v);
            break;

        case 'h':
            this.prop.h = v;
            v /= 2;
            this.vectors[0].y = v;
            this.vectors[1].v = -v;
            g.vertices[0].y = v;
            g.vertices[1].y = v;
            g.vertices[2].y = -v;
            g.vertices[3].y = -v;
            this.recalcGeometry(g);
            n.attr('y1', p.y - v);
            n.attr('y2', p.y + v);
            break;

        case 'x':
            this.propagateComponent(k, v);
            p.x = v;
            let x1 = v - this.prop.w / 2,
                x2 = v + this.prop.w / 2;
            this.vectors[0].x = x1;
            this.vectors[1].x = x2;
            n.attr('x1', x1);
            n.attr('x2', x2);
            break;

        case 'y':
            this.propagateComponent(k, v);
            p.y = v;
            let h = this.prop.h / 2;
            this.vectors[0].y = v - h;
            this.vectors[1].y = v + h;
            let y1 = (-v - h),
                y2 = (-v + h);
            n.attr('y1', y1);
            n.attr('y2', y2);
            break;
    }
}

Editor.Item.Rectangle.prototype.recalcGeometry = function(geometry)
{
    let g = geometry;
    g.verticesNeedUpdate = true;
    g.normalsNeedUpdate = true;
    g.computeFaceNormals();
    g.computeVertexNormals();
    g.computeBoundingSphere();
}
