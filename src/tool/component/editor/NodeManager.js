"use strict";

Editor.NodeManager = function(document)
{
    this._doc = document;
}

Editor.NodeManager.prototype.addBehavior = function(rectNode, type)
{
    let document = this._doc,
        layoutNode = this.getLayout();

    if (!type) {
        type = rectNode[0].parentNode.tagName.toLowerCase();
    }

    let behaviorNode = layoutNode.find('> behaviors');
    if (behaviorNode.length === 0) {
        behaviorNode = $('<behaviors>', document);
        layoutNode.append(behaviorNode);
    }

    let typeNode = behaviorNode.find('> ' + type);
    if (typeNode.length === 0) {
        typeNode = $('<' + type + '>', document);
        behaviorNode.append(typeNode);
    }

    typeNode.append(rectNode);
}

Editor.NodeManager.prototype.addCameraPath = function(pathNode)
{
    let document = this._doc;

    let cameraNode = document.find('> camera');
    if (cameraNode.length === 0) {
        cameraNode = $('<camera>', document);
        document.prepend(cameraNode);
    }

    cameraNode.append(pathNode);
}

Editor.NodeManager.prototype.addCheckpoint = function(checkpointNode)
{
    let document = this._doc;

    let checkpointsNode = document.find('> checkpoints');
    if (checkpointsNode.length === 0) {
        checkpointsNode = $('<checkpoints>', document);
        document.prepend(checkpointsNode);
    }

    checkpointsNode.append(checkpointNode);
}

Editor.NodeManager.prototype.addObject = function(objectNode)
{
    let document = this._doc;

    let objectsNode = document.find('> objects');
    if (objectsNode.length === 0) {
        objectsNode = $('<objects>', document);
        document.append(objectsNode);
    }

    objectsNode.append(objectNode);
}

Editor.NodeManager.prototype.addObjectInstance = function(objectInstanceNode)
{
    let document = this._doc,
        layoutNode = this.getLayout();

    let objectInstancesNode = layoutNode.find('> objects');
    if (objectInstancesNode.length === 0) {
        objectInstancesNode = $('<objects>', document);
        layoutNode.append(objectInstancesNode);
    }

    objectInstancesNode.append(objectInstanceNode);
}

Editor.NodeManager.prototype.addSolid = function(solidNode)
{
    let document = this._doc,
        behaviorNode = this.getBehavior();

    let solidsNode = behaviorNode.find('> solids');
    if (solidsNode.length === 0) {
        solidsNode = $('<solids>', document);
        behaviorNode.append(solidsNode);
    }

    solidsNode.append(solidNode);
}

Editor.NodeManager.prototype.getBehavior = function()
{
    let document = this._doc,
        layoutNode = this.getLayout();

    let behaviorNode = layoutNode.find('> behaviors');
    if (behaviorNode.length === 0) {
        behaviorNode = $('<behaviors>', document);
        layoutNode.append(behaviorNode);
    }

    return behaviorNode;
}

Editor.NodeManager.prototype.getLayout = function()
{
    let document = this._doc,
        layoutNode = document.find('> layout');

    if (layoutNode.length === 0) {
        layoutNode = $('<layout>', document);
        document.append(layoutNode);
    }

    return layoutNode;
}
