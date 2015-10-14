"use strict";

Editor.Item.Behavior = function(object, node)
{
    this.behavior = object;
    let pos = object.position.clone();
    Editor.Item.Rectangle2.call(this, object.collision[0], node);
    this.moveTo(pos);
}

Editor.Item.Behavior.prototype = Object.create(Editor.Item.Rectangle2.prototype);
Editor.Item.Behavior.prototype.constructor = Editor.Item.Behavior;

Editor.Item.Behavior.prototype.TYPE = 'behavior';

Editor.Item.Behavior.material = new THREE.MeshBasicMaterial({color: 0x00a2ff, wireframe: true});

Editor.Item.Behavior.prototype.update = function()
{
    Editor.Item.Rectangle.prototype.update.call(this);
    this.behavior.position.copy(this.model.position);
    this.behavior.collision[0].position.set(0, 0);
}
