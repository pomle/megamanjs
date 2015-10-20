"use strict";

Editor.Modes = function(editor)
{
    this.input = function(e)
    {
    }

    this.edit = function(e)
    {

        if (e.type !== 'keydown') {
            return;
        }

        e.preventDefault();
        if (editor.items.selected === undefined) {
            return;
        }

        let g = editor.grid.scale.clone(),
            i = editor.items.selected[0],
            p = i;

        if (e.ctrlKey) {
            g.set(1, 1, 1);
        }

        switch (e.which) {
            case 107:
                editor.camera.zoomOut();
                break;
            case 109:
                editor.camera.zoomIn();
                break;

            case 72: // H
                editor.items.hide(i);
                editor.items.deselect();
                break;
        }

        if (editor.items.selected.length) {
            for (let i = 0, l = editor.items.selected.length; i !== l; ++i) {
                let item = editor.items.selected[i];
                switch (e.which) {
                    case 38:
                        item.y += g.y;
                        break;
                    case 40:
                        item.y -= g.y;
                        break;
                    case 39:
                        item.x += g.x;
                        break;
                    case 37:
                        item.x -= g.x;
                        break;
                    case 46: // DEL
                        editor.items.remove(item);
                        editor.items.deselect();
                        break;
                }
            }
        }

        editor.ui.item.inputs.update(i);
    }

    this.paint = function(e)
    {
        if (e.type === 'mousedown') {

        }
        else if (e.type === 'keydown') {
            if (e.which === 80) { // P
                editor.ui.palette.toggleClass('hidden');
            }
        }
    }

    this.play = function(e)
    {
        e.preventDefault();
        var i = editor.game.scene.inputs.character;

        switch (event.type) {
            case 'keydown':
                i.keyDownEvent(e.originalEvent);
                break;
            case 'keyup':
                i.keyUpEvent(e.originalEvent);
                break;
        }
    }

    this.view = function(e)
    {

        if (e.type !== 'keydown') {
            return;
        }

        e.preventDefault();
        let p = editor.game.scene.camera.camera.position,
            a = 64;

        switch (e.which) {
            case 107:
                editor.camera.zoomOut();
                break;
            case 109:
                editor.camera.zoomIn();
                break;

            case 38:
                p.y += a;
                break;
            case 40:
                p.y -= a;
                break;
            case 39:
                p.x += a;
                break;
            case 37:
                p.x -= a;
                break;
        }
    }
}
