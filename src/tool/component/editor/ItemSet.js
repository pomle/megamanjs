"use strict";

Editor.ItemSet = function(editor)
{
    this.editor = editor;

    this.layers = {};

    this.all = new Set();
    this.selected = new Set();
    this.selected.first = null;
    this.touchable = new Set();
    this.visible = new Set();
}

Object.defineProperties(Editor.ItemSet.prototype, {
    interactable: {
        get: function()
        {
            return [...this.touchable].filter(item => this.visible.has(item));
        },
    },
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
    item.children.forEach(child => {
        this.add(child);
    });

    const object = item.object;
    if (object instanceof Engine.Object) {
        this.world.addObject(object);
    }

    if (item.TYPE) {
        const type = item.TYPE;
        if (!this.layers[type]) {
            this.layers[type] = new Set();
        }
        this.layers[type].add(item);
    }

    if (item.TYPE === 'object') {
        this.scene.add(item.model);
    } else {
        this.editor.overlays.add(item.model);
    }

    this.all.add(item);
    this.touchable.add(item);
    this.visible.add(item);
}

Editor.ItemSet.prototype.insert = function(item)
{
    item.moveTo(this.editor.marker.position);
    this.deselect();
    this.add(item);
    this.select(item);
}

Editor.ItemSet.prototype.remove = function(item)
{
    item.children.forEach(child => {
        this.remove(child);
    });

    if (!this.all.has(item)) {
        console.error("Item not found", item);
        return false;
    }

    const object = item.object;
    if (object instanceof Engine.Object) {
        this.world.removeObject(object);
    }

    this.hide(item);

    if (item.TYPE) {
        this.layers[item.TYPE].delete(item);
    }

    item.delete();
    item.node.remove();

    this.all.delete(item);
}

Editor.ItemSet.prototype.deselect = function(item)
{
    if (arguments.length === 0) {
        this.selected.forEach(item => {
            this.deselect(item);
        });
    } else {
        if (item.overlay) {
            this.editor.overlays.remove(item.overlay);
            item.overlay = undefined;
        }
        this.selected.delete(item);

        const inputs = this.editor.ui.item.inputs;
        if (this.selected.size === 1) {
            this.selected.first = [...this.selected][0];
            inputs.update([...this.selected][0]);
        } else {
            if  (this.selected.size === 0) {
                this.selected.first = null;
            }
            inputs.clear();
        }
    }
}

Editor.ItemSet.prototype.select = function(item)
{
    this.deselect(item);
    this.selected.add(item);
    this.selected.first = item;

    item.overlay = new THREE.WireframeHelper(item.model, 0x00ff00);
    this.editor.overlays.add(item.overlay);

    const ui = this.editor.ui;
    ui.item.inputs.update(item);
    if (item.node.length) {
        ui.console.textarea.val(item.node[0].outerHTML);
    }
}

Editor.ItemSet.prototype.lock = function(item)
{
    item.children.forEach(child => {
        this.lock(child);
    });
    this.deselect(item);
    this.touchable.delete(item);
}

Editor.ItemSet.prototype.unlock = function(item)
{
    item.children.forEach(child => {
        this.unlock(child);
    });
    this.touchable.add(item);
}

Editor.ItemSet.prototype.hide = function(item)
{
    item.children.forEach(child => {
        this.hide(child);
    });

    this.deselect(item);

    item.model.visible = false;
    this.visible.delete(item);

    const toggler = this.editor.ui.view.layers[item.TYPE];
    if (toggler) {
        toggler.checked = false;
    }
}

Editor.ItemSet.prototype.show = function(item)
{
    item.children.forEach(child => {
        this.show(child);
    });

    item.model.visible = true;
    this.visible.add(item);
}
