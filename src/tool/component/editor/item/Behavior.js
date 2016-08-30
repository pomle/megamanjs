"use strict";

Editor.Item.Behavior = function(object, node)
{
    if(object.traits.length === 1) {
        if (object.solid) {
            this.MATERIAL = this.MATERIALS.solid;
        } else if (object.climbable) {
            this.MATERIAL = this.MATERIALS.climbable;
        } else if (object.deathZone) {
            this.MATERIAL = this.MATERIALS.deathzone;
        }
    }

    Editor.Item.Rectangle2.call(this, object, node, object.collision[0]);
    object.collision[0].geometry = this.model.geometry;
    this.moveTo(object.position);
}

Editor.Item.Behavior.prototype = Object.create(Editor.Item.Rectangle2.prototype);
Editor.Item.Behavior.prototype.constructor = Editor.Item.Behavior;

Editor.Item.Behavior.prototype.TYPE = 'behavior';

Editor.Item.Behavior.prototype.MATERIALS = {
    climbable: new THREE.MeshBasicMaterial({
        color: Editor.COLORS.behavior.climbable,
        wireframe: true,
    }),
    deathzone: new THREE.MeshBasicMaterial({
        color: Editor.COLORS.behavior.deathzone,
        wireframe: true,
    }),
    solid: new THREE.MeshBasicMaterial({
        color: Editor.COLORS.behavior.solid,
        wireframe: true,
    }),
}

Editor.Item.Behavior.prototype.update = function()
{
    Editor.Item.Rectangle.prototype.update.call(this);
    this.object.position.copy(this.model.position);
}
