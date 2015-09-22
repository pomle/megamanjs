"use strict";

Editor.ComponentFactory = function(editor)
{
    this.editor = editor;
}

Editor.ComponentFactory.prototype.createCameraPath = function()
{
    let editor = this.editor,
        nodeFactory = editor.nodeFactory,
        itemFactory = editor.itemFactory,
        pathNode = nodeFactory.createCameraPath(),
        parser = new Game.Loader.XML.Parser(),
        cameraPath = parser.getCameraPath(pathNode);

    let windowItem = itemFactory.create('cameraWindow', pathNode.find('> window'))(cameraPath.window);
    windowItem.object.position.z = 0;
    editor.items.add(windowItem);

    let constraintItem = itemFactory.create('cameraConstraint', pathNode.find('> constraint'))(cameraPath.constraint);
    constraintItem.object.position.z = windowItem.object.position.z + 1;
    editor.items.add(constraintItem);

    windowItem.addChild(constraintItem);

    editor.game.scene.camera.addPath(cameraPath);

    editor.ui.view.layers.cameraPath.on();
}
