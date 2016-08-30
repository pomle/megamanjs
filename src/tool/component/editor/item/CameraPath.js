"use strict";

Editor.Item.CameraPath = function(cameraPath, node)
{
    Editor.Item.Rectangle.call(this, cameraPath, $(node).find('> window'),
        cameraPath.window[0], cameraPath.window[1]);

    this.model = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 1, 1),
        this.MATERIALS.window);

    const constraint = new Editor.Item.Rectangle(cameraPath, $(node).find('> constraint'),
        cameraPath.constraint[0], cameraPath.constraint[1]);

    constraint.model = new THREE.Mesh(
        new THREE.PlaneGeometry(25, 25, 1, 1),
        this.MATERIALS.constraint);

    this.addChild(constraint);

    this.update();
    constraint.update();
}

Editor.Item.CameraPath.prototype = Object.create(Editor.Item.Rectangle.prototype);
Editor.Item.CameraPath.prototype.constructor = Editor.Item.CameraPath;

Editor.Item.CameraPath.prototype.TYPE = 'cameraPath';

Editor.Item.CameraPath.prototype.MATERIALS = {
    constraint: new THREE.MeshBasicMaterial({
        color: Editor.COLORS.camera.constraint,
        wireframe: true,
    }),
    window: new THREE.MeshBasicMaterial({
        color: Editor.COLORS.camera.window,
        wireframe: true,
    }),
}
