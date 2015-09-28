"use strict";

Editor.Item.Checkpoint = function(checkpoint, node)
{
    Editor.Item.Point.call(this, checkpoint, node);

    this.model = new THREE.Mesh(
        new THREE.CircleGeometry(checkpoint.radius, 16),
        this.materials.checkpoint
    );

    this.point = this.model.position;
    this.moveTo(checkpoint.pos);
    checkpoint.pos = this.model.position;
}

Editor.Item.Checkpoint.prototype = Object.create(Editor.Item.Point.prototype);
Editor.Item.Checkpoint.prototype.constructor = Editor.Item.Checkpoint;

Editor.Item.Checkpoint.prototype.TYPE = 'checkpoint';

Editor.Item.Checkpoint.prototype.materials = {
    checkpoint: new THREE.MeshBasicMaterial({color: 0xeb1e32, wireframe: true}),
}
