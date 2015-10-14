"use strict";

Editor.ModelManager = function(editor)
{
    this.editor = editor;
}

Editor.ModelManager.prototype.expose = function(model)
{
    let editor = this.editor;
    if (!editor.game.scene) {
        console.error("Editor scene not loaded");
        return;

    }
    let scene = editor.game.scene.world.scene;

    for (let i = 0, l = scene.children.length; i !== l; ++i) {
        if (scene.children === model) {
            console.log("Model already in scene");
            return;
        }
    }

    scene.add(model);
}


Editor.ModelManager.prototype.obscure = function(model)
{
    let editor = this.editor;
    if (!editor.game.scene) {
        console.error("Editor scene not loaded");
        return;
    }

    let scene = editor.game.scene.world.scene;
    scene.remove(model);
}
