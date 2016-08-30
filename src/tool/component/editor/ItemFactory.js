"use strict";

Editor.ItemFactory = function(editor)
{
}

Editor.ItemFactory.prototype.create = function(type, node)
{
    let factory = this,
        colors = Editor.Colors;

    switch (type) {
        case 'behavior':
            return function(geometry) {
                let model = new THREE.Mesh(
                    geometry,
                    new THREE.MeshBasicMaterial({color: colors[type], wireframe: true})
                );

                let object = new Engine.Object();
                object.setModel(model);

                let item = new Editor.Item(object, node);
                item.type = type;
                return item;
            }
            break;

        case 'cameraConstraint':
            return function(constraint) {
                let w = constraint[1].x - constraint[0].x,
                    h = constraint[1].y - constraint[0].y,
                    x = constraint[0].x + w / 2,
                    y = constraint[0].y + h / 2;

                let model = new THREE.Mesh(
                    new THREE.PlaneGeometry(w || 1, h || 1, 1, 1),
                    new THREE.MeshBasicMaterial({color: colors[type], wireframe: true})
                );

                let object = new Engine.Object();
                object.setModel(model);
                object.position.x = x;
                object.position.y = y;

                let item = new Editor.Item.Rectangle(object, node, constraint[0], constraint[1]);
                item.type = type;
                return item;
            }
            break;

        case 'cameraWindow':
            return function(win) {
                let w = win[1].x - win[0].x,
                    h = win[1].y - win[0].y,
                    x = win[0].x + w / 2,
                    y = win[0].y + h / 2;

                let model = new THREE.Mesh(
                    new THREE.PlaneGeometry(w || 1, h || 1, 1, 1),
                    new THREE.MeshBasicMaterial({color: colors[type], wireframe: true})
                );

                let object = new Engine.Object();
                object.setModel(model);
                object.position.x = x;
                object.position.y = y;

                let item = new Editor.Item.Rectangle(object, node, win[0], win[1]);
                item.type = type;
                return item;
            }
            break;

        case 'checkpoint':
            return function(checkpoint) {
                let model = new THREE.Mesh(
                    new THREE.CircleGeometry(checkpoint.radius, 16),
                    new THREE.MeshBasicMaterial({color: colors[type], wireframe: true})
                );

                let object = new Engine.Object();
                object.setModel(model);
                object.position.x = checkpoint.pos.x;
                object.position.y = checkpoint.pos.y;

                let item = new Editor.Item.Point(object, node, checkpoint.pos);
                item.type = type;
                return item;
            }
            break;
    }

    throw new Error("Unknown type " + type);
}
