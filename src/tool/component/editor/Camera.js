"use strict";

Editor.Camera = function(editor)
{
    this.editor = editor;
    this.zoomFactor = Math.sqrt(2);
}

Object.defineProperties(Editor.Camera.prototype, {
    camera: {
        get: function() {
            return this.editor.game.scene.camera.camera;
        },
    },
    position: {
        get: function() {
            return this.camera.position;
        },
    },
});

Editor.Camera.prototype.centerGrid = function()
{
    let grid = this.editor.grid;
    grid.position.copy(this.camera.position);
    grid.snapVector(grid.position);
    grid.position.z = 0;
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

Editor.Camera.prototype.moveTo = function(vec2)
{
    let c = this.editor.game.scene.camera.camera;
    c.position.x = vec2.x;
    c.position.y = vec2.y;
}

Editor.Camera.prototype.nudge = function(vec2)
{
    let c = this.editor.game.scene.camera.camera,
        p = c.position.clone();
    p.x += vec2.x;
    p.y += vec2.y;
    this.moveTo(p);
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
