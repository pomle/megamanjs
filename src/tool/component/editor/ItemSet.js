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

Editor.ItemSet.prototype._apply = function(func, items)
{
    for (let i = 0, l = items.length; i !== l; ++i) {
        func.call(this, items[i]);
    }
}


Editor.ItemSet.prototype.add = function(item)
{
    let object = item.object;

    if (object instanceof Engine.Object
    && !this.world.objects.has(object)) {
        this.world.addObject(object);
    }

    if (item.TYPE) {
        let type = item.TYPE;
        if (!this.layers[type]) {
            this.layers[type] = new Set();
            this.layers[type].scene = new THREE.Scene();
            this.editor.layers.push(this.layers[type].scene);
        }
        this.layers[type].add(item);
    }

    this._apply(this.add, item.children);
    this.items.add(item);
    this.show(item);
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

    this._apply(this.remove, item.children);

    this.hide(item);

    item.delete();
    item.node.remove();

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

        this._apply(this.hide, item.children);

        if (item.TYPE !== "object") {
            this.scene.remove(item.model);
        } else {
            this.layers[item.TYPE].scene.remove(item.model);
        }

        this.visible.delete(item);
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

        this._apply(this.show, item.children);

        if (item.TYPE !== "object") {
            this.scene.add(item.model);
        } else {
            this.layers[item.TYPE].scene.add(item.model);
        }

        this.visible.add(item);
    }
}
