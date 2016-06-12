"use strict";

Editor.Item.Behavior = function(object, node)
{
    Editor.Item.Rectangle2.call(this, object, node, object.collision[0]);
    object.collision[0].geometry = this.model.geometry;
    this.moveTo(object.position);
}

Editor.Item.Behavior.prototype = Object.create(Editor.Item.Rectangle2.prototype);
Editor.Item.Behavior.prototype.constructor = Editor.Item.Behavior;

Editor.Item.Behavior.prototype.TYPE = 'behavior';

Editor.Item.Behavior.material = new THREE.MeshBasicMaterial({color: 0x00a2ff, wireframe: true});

/*
Editor.Item.Behavior.prototype.clone = function()
{
    var node = this.node.clone();
    node.insertAfter(this.node);
    return new this.constructor(new this.behavior.constructor(), node);
}*/

Editor.Item.Behavior.prototype.update = function()
{
    Editor.Item.Rectangle.prototype.update.call(this);
    this.object.position.copy(this.model.position);
}
