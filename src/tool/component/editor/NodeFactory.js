"use strict";

Editor.NodeFactory = function(editor)
{
    this.editor = editor;
}

Editor.NodeFactory.prototype.createCameraPath = function()
{
    let document = this.editor.document,
        pos = this.editor.marker.position,
        windowW = 256,
        windowH = 240,
        constraintW = 100,
        constraintH = 100;

    let cameraNode = document.find('> camera');
    if (cameraNode.length === 0) {
        cameraNode = $('<camera>', document);
        document.prepend(cameraNode);
    }

    let pathNode = $('<path>', document);
    cameraNode.append(pathNode);

    let windowNode = $('<window>', document).attr({
        x1: pos.x - windowW / 2,
        x2: pos.x + windowW / 2,
        y1: pos.y + windowH / 2,
        y2: pos.y - windowH / 2,
    });
    pathNode.append(windowNode);

    let constraintNode = $('<constraint>', document).attr({
        x1: pos.x - constraintW / 2,
        x2: pos.x + constraintW / 2,
        y1: pos.y + constraintH / 2,
        y2: pos.y - constraintH / 2,
    });
    pathNode.append(constraintNode);

    return pathNode;
}
