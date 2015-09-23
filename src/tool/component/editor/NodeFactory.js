"use strict";

Editor.NodeFactory = function(editor)
{
    this.editor = editor;
}

Editor.NodeFactory.prototype.addCameraPath = function(pathNode)
{
    let document = editor.document;

    let cameraNode = document.find('> camera');
    if (cameraNode.length === 0) {
        cameraNode = $('<camera>', document);
        document.prepend(cameraNode);
    }

    cameraNode.append(pathNode);
}

Editor.NodeFactory.prototype.createCameraPath = function()
{
    let editor = this.editor,
        document = editor.document,
        pos = this.editor.marker.position.clone(),
        windowW = 256,
        windowH = 240,
        constraintW = 100,
        constraintH = 100;

    pos.roundToZero();

    let pathNode = $('<path>', document);

    let windowNode = $('<window>', document).attr({
        x1: pos.x - windowW / 2,
        x2: pos.x + windowW / 2,
        y1: -(pos.y + windowH / 2),
        y2: -(pos.y - windowH / 2),
    });
    pathNode.append(windowNode);

    let constraintNode = $('<constraint>', document).attr({
        x1: pos.x - constraintW / 2,
        x2: pos.x + constraintW / 2,
        y1: -(pos.y + constraintH / 2),
        y2: -(pos.y - constraintH / 2),
    });
    pathNode.append(constraintNode);

    return pathNode;
}

Editor.NodeFactory.prototype.createObject = function()
{
    let uniqueId = 'object_' + THREE.Math.generateUUID().replace(/-/g, '');

    let objectNode = $('<object/>', editor.node).attr({
        'id': uniqueId,
    });
    let geometryNode = $('<geometry/>', editor.node).attr({
        'type': 'plane',
        'w': size.x,
        'h': size.y,
        'w-segments': size.sx || 1,
        'h-segments': size.sy || 1,
    });
    objectNode.append(geometryNode);
    editor.node.object.append(objectNode);

    let game = this.editor.game,
        loader = new Game.Loader.XML(game),
        parser = new Game.Loader.XML.Parser.ObjectParser(loader);

    let objectRef = parser.getObject(objectNode);

    let objectInstanceNode = $('<object/>', editor.node).attr({
        'id': uniqueId,
    });

    editor.node.layout.objects.append(objectInstanceNode);

    let item = new Editor.Item(new objectRef(), objectInstanceNode);
    editor.items.insert(item);

    return item;
}
