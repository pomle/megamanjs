"use strict";

Editor.Camera = function(editor)
{
    this.editor = editor;
    this.zoomFactor = Math.sqrt(2);
}

Editor.Camera.prototype.followSelected = function()
{
    let e = this.editor,
        i = e.items.selected[0],
        c = e.game.scene.camera;

    if (!i) {
        return;
    }

    c.follow(i.object);
}


Editor.Camera.prototype.zoom = function(factor)
{
    let c = this.editor.game.scene.camera.camera;
    this.editor.ui.freeCamera();
    c.position.z = c.position.z * factor;
}

Editor.Camera.prototype.zoomOut = function()
{
    this.zoom(1 / this.zoomFactor);
}

Editor.Camera.prototype.zoomIn = function()
{
    this.zoom(this.zoomFactor);
}
