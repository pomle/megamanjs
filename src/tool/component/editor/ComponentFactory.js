"use strict";

Editor.ComponentFactory = function(editor)
{
    this.editor = editor;
}

Editor.ComponentFactory.prototype.createCameraPath = function()
{
    let nodeFactory = editor.nodeFactory,
        itemFactory = editor.itemFactory,
        pathNode = nodeFactory.createCameraPath(),
        parser = new Game.Loader.XML.Parser(),
        cameraPath = parser.getCameraPath(pathNode);

    let windowItem = itemFactory.create('cameraWindow', pathNode.find('> window'))(cameraPath.window);
    windowItem.object.position.z = 0;
    this.editor.items.add(windowItem);

    let constraintItem = itemFactory.create('cameraConstraint', pathNode.find('> constraint'))(cameraPath.constraint);
    constraintItem.object.position.z = windowItem.object.position.z + 1;
    this.editor.items.add(constraintItem);
}
