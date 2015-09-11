"use strict";

Editor.ItemSet = function(editor)
{
    this.editor = editor;

    this.items = new Set();
    this.selected = undefined;
    this.visible = new Set();

    for (let prop of ['entries']) {
        this.items[prop] = this.items[prop].bind(this.items);
    }

    this.inputs = undefined;
}

Object.defineProperties(Editor.Item.prototype, {
    scene: {
        get: function() {
            this.world.scene;
        },
    },
    world: {
        get: function() {
            this.editor.game.scene.world;
        },
    },
});

Editor.ItemSet.prototype.add = function(item)
{
    if (this.world) {
        this.world.addObject(item.object);
    }

    this.items.add(item);
    this.show(item);
}

Editor.ItemSet.prototype.clear = function()
{
    this.items.clear();
    this.visible.clear();
}

Editor.ItemSet.prototype.deselect = function()
{
    if (this.selected) {
        var item = this.selected;
        if (item.overlay) {
            item.object.model.remove(item.overlay);
            item.overlay = undefined;
        }
    }

    this.selected = undefined;
    console.log("Selected item", this.selected);

    this.inputs.clear();
}

Editor.ItemSet.prototype.select = function(item)
{
    this.deselect();
    this.selected = item;

    item.overlay = new THREE.Mesh(
        item.object.model.geometry,
        new THREE.MeshBasicMaterial({color: '#00ff00', wireframe: true}));

    item.object.model.add(item.overlay);
    item.overlay.translateZ(.1);

    this.inputs.update(item);
}

Editor.ItemSet.prototype.remove = function(item)
{
    if (!this.items.has(item)) {
        console.error("Item not found", item);
        return false;
    }

    this.world.removeObject(item.object);

    item.node.remove();

    this.items.delete(item);
    this.visible.delete(item);
}

Editor.ItemSet.prototype.hide = function(item)
{
    if (this.selected === item) {
        this.deselect();
    }

    this.rawScene.remove(item.object.model);
    this.visible.delete(item);
    console.log("Hid item", item);
}

Editor.ItemSet.prototype.show = function(item)
{
    if (this.rawScene) {
        this.rawScene.add(item.object.model);
    }
    this.visible.add(item);
    console.log("Exposed item", item);
}
