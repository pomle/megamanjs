"use strict";

Editor.ItemSet = function(editor)
{
    this.editor = editor;

    this.items = new Set();
    this.layers = {};

    this.selected = [];
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

Editor.ItemSet.prototype.add = function()
{
    for (let i = 0, l = arguments.length; i !== l; ++i) {
        let item = arguments[i];
        let object = item.object;

        if (object instanceof Engine.Object
        && !this.world.objects.has(object)) {
            this.world.addObject(object);
        }

        if (item.children.length !== 0) {
            this.add.apply(this, item.children);
        }

        if (item.TYPE) {
            let t = item.TYPE;
            if (!this.layers[t]) {
                this.layers[t] = new Set();
            }
            this.layers[t].add(item);
        }

        this.items.add(item);
        this.show(item);
    }
}

Editor.ItemSet.prototype.deselect = function()
{
    if (this.selected.length) {
        for (let i = 0, l = this.selected.length; i !== l; ++i) {
            let item = this.selected[i];
            if (item.overlay) {
                this.editor.overlays.remove(item.overlay);
                item.overlay = undefined;
            }
        }
    }

    this.selected = [];

    this.editor.ui.item.inputs.clear();
}

Editor.ItemSet.prototype.select = function(item)
{
    this.selected.unshift(item);

    item.overlay = new THREE.WireframeHelper(item.model, 0x00ff00);
    this.editor.overlays.add(item.overlay);
    this.editor.ui.item.inputs.update(item);

    if (item.node.length) {
        this.editor.ui.console.textarea.val(item.node[0].outerHTML);
    }
}

Editor.ItemSet.prototype.remove = function()
{
    for (let i = 0, l = arguments.length; i !== l; ++i) {
        let item = arguments[i];

        if (!this.items.has(item)) {
            console.error("Item not found", item);
            return false;
        }

        if (item.children.length !== 0) {
            this.remove.apply(this, item.children);
        }

        let object = item.object;

        if (object instanceof Engine.Object
        && this.world.objects.has(object)) {
            this.world.removeObject(object);
        }

        this.hide(item);

        if (item.TYPE) {
            this.layers[item.TYPE].delete(item);
        }

        item.delete();
        item.node.remove();

        this.items.delete(item);
    }
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

        if (item.children.length !== 0) {
            this.hide.apply(this, item.children);
        }

        if (!this.scene) {
            return false;
        }

        if (this.selected === item) {
            this.deselect();
        }

        if (item.TYPE === "object") {
            this.scene.remove(item.model);
        } else {
            this.editor.overlays.remove(item.model);
        }

        let toggler = this.editor.ui.view.layers[item.TYPE];
        if (toggler) {
            toggler.checked = false;
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

        if (item.children.length !== 0) {
            this.show.apply(this, item.children);
        }

        if (item.TYPE === "object") {
            this.scene.add(item.model);
        } else {
            this.editor.overlays.add(item.model);
        }

        this.visible.add(item);
    }
}
