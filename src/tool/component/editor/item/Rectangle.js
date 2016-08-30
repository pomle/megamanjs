"use strict";

Editor.Item.Rectangle = function(object, node, vec1, vec2)
{
    Editor.Item.call(this, object, node);

    this.model = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 1, 1),
        this.MATERIAL);

    this.vectors = [vec1, vec2];

    this.update();
}

Editor.Item.Rectangle.prototype = Object.create(Editor.Item.prototype);
Editor.Item.Rectangle.prototype.constructor = Editor.Item.Rectangle;

Editor.Item.Rectangle.prototype.getComponent = function(name)
{
    let v;
    switch (name) {
        case 'x':
            v = this.vectors[0].x + (this.w / 2);
            break;
        case 'y':
            v = this.vectors[0].y + (this.h / 2);
            break;
        case 'w':
            v = this.vectors[1].x - this.vectors[0].x;
            break;
        case 'h':
            v = this.vectors[1].y - this.vectors[0].y;
            break;
    }

    return this.round(v);
}

Editor.Item.Rectangle.prototype.setComponent = function(name, value)
{
    let d, x, y,
        k = name,
        v = this.round(value),
        vec = this.vectors;

    switch (k) {
        case 'w':
            v = Math.abs(v / 2);
            x = this.x;
            vec[0].x = x - v;
            vec[1].x = x + v;
            break;

        case 'h':
            v = Math.abs(v / 2);
            y = this.y;
            vec[0].y = y - v;
            vec[1].y = y + v;
            break;

        case 'x':
            this.propagateComponent(k, v);
            d = v - this.x;
            vec[0].x += d;
            vec[1].x += d;
            break;

        case 'y':
            this.propagateComponent(k, v);
            d = v - this.y;
            vec[0].y += d;
            vec[1].y += d;
            break;
    }

    this.update();
}

Editor.Item.Rectangle.prototype.updateGeometry = function()
{
    let g = this.model.geometry,
        v = this.vectors,
        x = this.x,
        y = this.y;

    let r = [
        v[0].x - x,
        v[1].x - x,
        v[1].y - y,
        v[0].y - y,
    ];

    for (let i = 0, l = r.length; i !== l; ++i) {
        r[i] = Math.max(.5, Math.abs(r[i]));
    }

    g.vertices[0].x = -r[0];
    g.vertices[1].x = r[1];
    g.vertices[2].x = -r[0];
    g.vertices[3].x = r[1];

    g.vertices[0].y = r[2];
    g.vertices[1].y = r[2];
    g.vertices[2].y = -r[3];
    g.vertices[3].y = -r[3];

    g.verticesNeedUpdate = true;
    g.normalsNeedUpdate = true;
    g.computeFaceNormals();
    g.computeVertexNormals();
    g.computeBoundingSphere();
}

Editor.Item.Rectangle.prototype.updateNode = function()
{
    let v = this.vectors,
        n = this.node;

    n.attr({
        "x1": this.round(v[0].x),
        "x2": this.round(v[1].x),
        "y1": this.round(v[0].y),
        "y2": this.round(v[1].y),
    });
}

Editor.Item.Rectangle.prototype.update = function()
{
    let x = this.x,
        y = this.y;

    this.model.position.x = x;
    this.model.position.y = y;

    this.updateGeometry();
    this.updateNode();
}
