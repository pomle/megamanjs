"use strict";

Editor.NodeManager = function(document)
{
    this.document = document;
}


Editor.NodeManager.prototype.addCameraPath = function(pathNode)
{
    let document = this.document;

    let cameraNode = document.find('> camera');
    if (cameraNode.length === 0) {
        cameraNode = $('<camera>', document);
        document.prepend(cameraNode);
    }

    cameraNode.append(pathNode);
}

Editor.NodeManager.prototype.addCheckpoint = function(checkpointNode)
{
    let document = this.document;

    let checkpointsNode = document.find('> checkpoints');
    if (checkpointsNode.length === 0) {
        checkpointsNode = $('<checkpoints>', document);
        document.prepend(checkpointsNode);
    }

    checkpointsNode.append(checkpointNode);
}

Editor.NodeManager.prototype.addObject = function(objectNode)
{
    let document = this.document;

    let objectsNode = document.find('> objects');
    if (objectsNode.length === 0) {
        objectsNode = $('<objects>', document);
        document.append(objectsNode);
    }

    objectsNode.append(objectNode);
}
