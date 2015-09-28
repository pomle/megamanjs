"use strict";

Editor.NodeFactory = function(editor)
{
    this.editor = editor;
}

Editor.NodeFactory.prototype.createCameraPath = function()
{
    let editor = this.editor,
        document = editor.document,
        pos = new THREE.Vector2(),
        windowW = 256,
        windowH = 240,
        constraintW = 100,
        constraintH = 100;

    let pathNode = $('<path>', document);

    let windowNode = $('<window>', document).attr({
        x1: pos.x - windowW / 2,
        x2: pos.x + windowW / 2,
        y1: pos.y - windowH / 2,
        y2: pos.y + windowH / 2,
    });
    pathNode.append(windowNode);

    let constraintNode = $('<constraint>', document).attr({
        x1: pos.x - constraintW / 2,
        x2: pos.x + constraintW / 2,
        y1: pos.y - constraintH / 2,
        y2: pos.y + constraintH / 2,
    });
    pathNode.append(constraintNode);

    return pathNode;
}

Editor.NodeFactory.prototype.createCheckpoint = function()
{
    let editor = this.editor,
        document = editor.document;

    let node = $('<checkpoint>', document).attr({
        'x': 0,
        'y': 0,
        'r': 100,
    });

    return node;
}


Editor.NodeFactory.prototype.createObject = function(size)
{
    let editor = this.editor,
        document = editor.document;

    let uniqueId = 'object_' + THREE.Math.generateUUID().replace(/-/g, '');

    let objectNode = $('<object/>', document).attr({
        'id': uniqueId,
    });

    let geometryNode = $('<geometry/>', document).attr({
        'type': 'plane',
        'w': size.x,
        'h': size.y,
        'w-segments': size.sx || 1,
        'h-segments': size.sy || 1,
    });

    objectNode.append(geometryNode);

    return objectNode;
}

Editor.NodeFactory.prototype.createObjectInstance = function(objectInstance)
{
    let editor = this.editor,
        document = editor.document;

    let objectInstanceNode = $('<object/>', document).attr({
        'id': objectInstance.name,
        'x': objectInstance.position.x,
        'y': objectInstance.position.y,
    });

    return objectInstanceNode;
}
