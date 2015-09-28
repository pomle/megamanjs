"use strict";

Editor.Item.Behavior = function(object, node)
{
    Editor.Item.call(this, object, node);

    this.model = new THREE.Mesh(
        object.collision[0].geometry,
        new THREE.MeshBasicMaterial({color: Editor.Colors['behavior'], wireframe: true})
    );
}

Editor.Item.Behavior.prototype = Object.create(Editor.Item.prototype);
Editor.Item.Behavior.prototype.constructor = Editor.Item.Behavior;

Editor.Item.Behavior.prototype.TYPE = 'behavior';
