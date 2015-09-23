"use strict";

Editor.ComponentFactory = function(editor)
{
    this.editor = editor;
}

Editor.ComponentFactory.prototype.createCameraPath = function(pathNode, cameraPath)
{
    let editor = this.editor,
        itemFactory = editor.itemFactory;

    if (cameraPath === undefined) {
        let parser = new Game.Loader.XML.Parser();
        cameraPath = parser.getCameraPath(pathNode);
    }

    let windowItem = itemFactory.create('cameraWindow', pathNode.find('> window'))(cameraPath.window);
    windowItem.object.position.z = 0;

    let constraintItem = itemFactory.create('cameraConstraint', pathNode.find('> constraint'))(cameraPath.constraint);
    constraintItem.object.position.z = windowItem.object.position.z + 1;

    windowItem.addChild(constraintItem);

    windowItem.delete = function() {
        pathNode.remove();
        let paths = editor.game.scene.camera.paths;
        for (let i = 0, l = paths.length; i !== l; ++i) {
            if (cameraPath === paths[i]) {
                paths.splice(i, 1);
                editor.game.scene.camera.pathIndex = -1;
            }
        }
    }

    editor.items.add(windowItem);
    editor.items.add(constraintItem);

    return {
        cameraPath: cameraPath,
        items: [windowItem, constraintItem]
    }
}
