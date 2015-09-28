"use strict";

Editor.Item.Rectangle = function(object, node, vec1, vec2)
{
    Editor.Item.call(this, object, node);

    this.model = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 1, 1),
        new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: true}));

    this.vectors = [vec1, vec2];

    this.update();
}

Editor.Item.Rectangle.prototype = Object.create(Editor.Item.prototype);
Editor.Item.Rectangle.prototype.constructor = Editor.Item.Rectangle;

Editor.Item.Rectangle.prototype.getComponent = function(name)
{
    let k = name,
        m = this.model,
        p = m.position,
        g = m.geometry,
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
        p = this.model.position,
        vec = this.vectors;

    switch (k) {
        case 'w':
            v /= 2;
            vec[0].x = -v;
            vec[1].x = v;
            break;

        case 'h':
            v /= 2;
            vec[0].y = v;
            vec[1].y = -v;
            break;

        case 'x':
            this.propagateComponent(k, v);
            p.x = v;
            break;

        case 'y':
            this.propagateComponent(k, v);
            p.y = -v;
            break;
    }

    this.update();
}

Editor.Item.Rectangle.prototype.updateGeometry = function(g)
{
    g.verticesNeedUpdate = true;
    g.normalsNeedUpdate = true;
    g.computeFaceNormals();
    g.computeVertexNormals();
    g.computeBoundingSphere();
}

Editor.Item.Rectangle.prototype.update = function()
{
    let p = this.model.position,
        g = this.model.geometry,
        n = this.node,
        v = this.vectors;

    g.vertices[0].x = v[0].x - p.x;
    g.vertices[1].x = v[1].x - p.x;
    g.vertices[2].x = v[0].x - p.x;
    g.vertices[3].x = v[1].x - p.x;

    g.vertices[0].y = v[0].y - p.y;
    g.vertices[1].y = v[1].y - p.y;
    g.vertices[2].y = v[0].y - p.y;
    g.vertices[3].y = v[1].y - p.y;

    this.updateGeometry(g);

    n.attr({
        x1: v[0].x,
        x2: v[1].x,
        y1: -v[0].y,
        y2: -v[1].y,
    });
}
