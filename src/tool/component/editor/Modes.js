"use strict";

Editor.Modes = function(editor)
{
    this.editor = editor;

    this.edit = function(e)
    {
        if (e.type !== 'keydown') {
            return;
        }

        e.preventDefault();

        if (e.which === 80 && e.ctrlKey) { // P (play)
            if (!editor.game.player.character) {
                console.error("No character set");
                return;
            }
            editor.activeMode = editor.modes.play;
            editor.ui.playback.simulate.prop('checked', true).trigger('change');
            return;
        }
        const items = editor.items;
        const selected = items.selected;
        if (selected.length === 0) {
            return;
        }

        const grid = editor.grid.scale.clone();
        /* I ctrl key is pressed, increment 1 unit. */
        if (e.ctrlKey) {
            grid.set(1, 1, 1);
        }

        [...selected].forEach(item => {
            if (e.which === 38) { // Up
                if (e.shiftKey && item.h != null) {
                    item.h += grid.y;
                } else {
                    item.y += grid.y;
                }
            } else if (e.which === 40) { // Down
                if (e.shiftKey && item.h != null) {
                    item.h -= grid.y;
                } else {
                    item.y -= grid.y;
                }
            } else if (e.which === 39) { // Right
                if (e.shiftKey && item.w != null) {
                    item.w += grid.x;
                } else {
                    item.x += grid.x;
                }
            } else if (e.which === 37) { // Left
                if (e.shiftKey && item.w != null) {
                    item.w -= grid.x;
                } else {
                    item.x -= grid.x;
                }
            } else if (e.which === 72) { // H (hide)
                items.hide(item);
            } else if (e.which === 76) { // L (lock)
                items.lock(item);
            } else if (e.which === 68) { // D (duplicate)
                const clone = item.clone();
                items.deselect(item);
                const pos = item.position.clone();
                const offset = editor.grid.scale.clone();
                pos.x += offset.x;
                pos.y -= offset.y;
                clone.moveTo(pos);
                items.add(clone);
                items.select(clone);
            } else if (e.which === 46) { // DEL
                items.deselect(item);
                items.remove(item);
            }
        });
    };

    this.paint = (e) => {
        if (e.type === 'keydown') {
            if (e.which === 80) { // P
                this.editor.ui.palette.toggle();
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
            case 85:
                editor.items.visible = new Set(editor.items.items);
                break;
        }
    }
}
