"use strict";

Editor.ItemSet = function(editor)
{
    this.editor = editor;

    this.items = new Set();
    this.layers = {};
    this.selected = undefined;
    this.visible = new Set();

    for (let prop of ['entries']) {
        this.items[prop] = this.items[prop].bind(this.items);
    }
}

Object.defineProperties(Editor.ItemSet.prototype, {
    scene: {
        get: function() {
            if (!this.world) {
                return false;
            }
            return this.world.scene;
        },
    },
    world: {
        get: function() {
            if (!this.editor.game.scene) {
                return false;
            }
            return this.editor.game.scene.world;
        },
    },
});

Editor.ItemSet.prototype.add = function(item)
{
    let object = item.object;

    if (object instanceof Engine.Object
    && !this.world.objects.has(object)) {
        this.world.addObject(object);
    }

    if (item.type) {
        if (!this.layers[item.type]) {
            this.layers[item.type] = new Set();
        }
        this.layers[item.type].add(item);
    }

    this.items.add(item);
    this.show(item);
}

Editor.ItemSet.prototype.clear = function()
{
    this.layers = {};
    this.items.clear();
    this.visible.clear();
}

Editor.ItemSet.prototype.deselect = function()
{
    if (this.selected) {
        var item = this.selected;
        if (item.overlay) {
            this.editor.overlays.remove(item.overlay);
            item.overlay = undefined;
        }
    }

    this.selected = undefined;

    this.editor.ui.item.inputs.clear();
}

Editor.ItemSet.prototype.select = function(item)
{
    this.deselect();
    this.selected = item;

    item.overlay = new THREE.WireframeHelper(item.model, 0x00ff00);
    this.editor.overlays.add(item.overlay);

    console.log("Selected item", this.selected);

    this.editor.ui.item.inputs.update(item);
}

Editor.ItemSet.prototype.remove = function(item)
{
    if (!this.items.has(item)) {
        console.error("Item not found", item);
        return false;
    }

    let object = item.object;

    if (object instanceof Engine.Object
    && this.world.objects.has(object)) {
        this.world.removeObject(object);
    }

    this.hide(item);
    for (let i = 0, l = item.children.length; i !== l; ++i) {
        this.remove(item.children[i]);
    }

    item.delete();
    item.node.remove();
    this.editor.overlays.remove(item.model);

    this.items.delete(item);
}

Editor.ItemSet.prototype.hide = function()
{
    if (arguments.length > 1) {
        this.show(arguments);
    }
    else if (Array.isArray(arguments[0])) {
        for (let i = 0, l = arguments[0].length; i < l; ++i) {
            this.hide(arguments[0][i]);
        }
    }
    else {
        let item = arguments[0];

        if (!this.scene) {
            return false;
        }

        if (this.selected === item) {
            this.deselect();
        }

        this.editor.overlays.remove(item.object.model);
        this.scene.remove(item.object.model);
        this.visible.delete(item);

        //console.log("Hid item", item);
    }
}

Editor.ItemSet.prototype.show = function()
{
    if (arguments.length > 1) {
        this.show(arguments);
    }
    else if (Array.isArray(arguments[0])) {
        for (let i = 0, l = arguments[0].length; i < l; ++i) {
            this.show(arguments[0][i]);
        }
    }
    else {
        let item = arguments[0];

        if (item.TYPE !== "object") {
            console.log(item.TYPE, item, item.model);
            this.editor.overlays.add(item.model);
        }

        this.visible.add(item);
    }
}
