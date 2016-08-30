"use strict";

Editor.Item.Mesh = function(mesh)
{
    Editor.Item.Point.call(this, mesh, $('<dummy>'), mesh.position);
    this.model = mesh;
}

Editor.Item.Mesh.prototype = Object.create(Editor.Item.Point.prototype);
Editor.Item.Mesh.prototype.constructor = Editor.Item.Mesh;
