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
        editor.game.scene.camera.addPath(cameraPath);
    }

    let item = new Editor.Item.CameraPath(cameraPath, pathNode);

    item.delete = function() {
        pathNode.remove();
        let paths = editor.game.scene.camera.paths;
        for (let i = 0, l = paths.length; i !== l; ++i) {
            if (cameraPath === paths[i]) {
                paths.splice(i, 1);
                editor.game.scene.camera.pathIndex = -1;
            }
        }
    }

    editor.items.add(item);

    return item;
}

Editor.ComponentFactory.prototype.createCheckpoint = function(checkPointNode, checkpoint)
{
    let editor = this.editor,
        level = editor.game.scene;

    if (checkpoint === undefined) {
        level.addCheckPoint(parseFloat(checkPointNode.attr('x')),
                            -parseFloat(checkPointNode.attr('y')),
                            parseFloat(checkPointNode.attr('r')));
        checkpoint = level.checkPoints[level.checkPoints.length - 1];
    }

    let item = new Editor.Item.Checkpoint(checkpoint, checkPointNode);

    item.delete = function() {
        checkPointNode.remove();
        let checkPoints = level.checkPoints;
        for (let i = 0, l = checkPoints.length; i !== l; ++i) {
            if (checkpoint === checkPoints[i]) {
                checkPoints.splice(i, 1);
            }
        }
    }

    editor.items.add(item);

    return item;
}

Editor.ComponentFactory.prototype.createObject = function(objectNode, objectRef)
{
    let editor = this.editor,
        itemFactory = editor.itemFactory,
        nodeFactory = editor.nodeFactory,
        nodeManager = editor.nodeManager;

    if (objectRef === undefined) {
        let parser = new Game.Loader.XML.Parser.ObjectParser();
        objectRef = parser.getObject(objectNode);
    }

    let objectInstance = new objectRef();

    let objectInstanceNode = nodeFactory.createObjectInstance(objectInstance);

    nodeManager.addObjectInstance(objectInstanceNode);

    let item = new Editor.Item.Object(objectInstance, objectInstanceNode);
    editor.items.add(item);

    return item;
}
