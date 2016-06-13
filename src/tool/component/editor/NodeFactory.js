"use strict";

Editor.NodeFactory = function(document)
{
    this._doc = document;
}

Editor.NodeFactory.prototype.createBehavior = function(type, size)
{
    const node = this.createRect(size);
    const wrapper = $(`<${type}s>`, this._doc);
    wrapper.append(node);
    return node;
}

Editor.NodeFactory.prototype.createCameraPath = function()
{
    const pos = new THREE.Vector2();
    const windowW = 256;
    const windowH = 240;
    const constraintW = 100;
    const constraintH = 100;

    const pathNode = $('<path>', this._doc);

    const windowNode = $('<window>', this._doc).attr({
        x1: pos.x - windowW / 2,
        x2: pos.x + windowW / 2,
        y1: pos.y - windowH / 2,
        y2: pos.y + windowH / 2,
    });
    pathNode.append(windowNode);

    const constraintNode = $('<constraint>', this._doc).attr({
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
    const node = $('<checkpoint>', this._doc).attr({
        'x': 0,
        'y': 0,
        'r': 100,
    });
    return node;
}


Editor.NodeFactory.prototype.createObject = function(size)
{
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let id = '';
    for (let i = 0, l = chars.length; i < 6; ++i) {
        id += chars[Math.floor(Math.random() * l)];
    }
    console.log(id);
    const objectNode = $('<object/>', this._doc).attr({
        'id': id,
    });

    const geometryNode = $('<geometry/>', this._doc).attr({
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
    const objectInstanceNode = $('<object/>', this._doc).attr({
        'id': objectInstance.name,
        'x': objectInstance.position.x,
        'y': objectInstance.position.y,
    });

    return objectInstanceNode;
}

Editor.NodeFactory.prototype.createRect = function(size)
{
    size = size || {};

    const node = $('<rect>', this._doc).attr({
        'x': 0,
        'y': 0,
        'w': size.x || 32,
        'h': size.y || 32,
    });

    return node;
}
