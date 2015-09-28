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

Editor.NodeManager.prototype.addObjectInstance = function(objectInstanceNode)
{
    let document = this.document,
        layoutNode = this.getLayout();

    let objectInstancesNode = layoutNode.find('> objects');
    if (objectInstancesNode.length === 0) {
        objectInstancesNode = $('<objects>', document);
        layoutNode.append(objectInstancesNode);
    }

    objectInstancesNode.append(objectInstanceNode);
}

Editor.NodeManager.prototype.getLayout = function()
{
    let document = this.document,
        layoutNode = document.find('> layout');

    if (layoutNode.length === 0) {
        layoutNode = $('<layout>', document);
        document.append(layoutNode);
    }

    return layoutNode;
}
