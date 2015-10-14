"use strict";

Editor.CameraManager = function(editor)
{
    this.editor = editor;
    this.buttons = {
        followSelected: $(),
    }
}

Editor.CameraManager.prototype.followSelected = function()
{
    if (!this.editor.items.selected) {

    }
}


Editor.CameraManager.prototype.obscure = function(model)
{
    let editor = this.editor;
    if (!editor.game.scene) {
        console.error("Editor scene not loaded");
        return;

    }
    let scene = editor.game.scene.world.scene;
    scene.remove(model);
}
