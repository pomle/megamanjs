"use strict";

var Editor = function()
{
    this.clipboard = new Editor.Clipboard();

    this.document = undefined;

    this.game = undefined;

    this.grid = new THREE.Vector3(16, 16, 1);

    this.items = new Editor.ItemSet();

    this.marker = new THREE.Mesh(
        new THREE.SphereGeometry(5, 32, 32),
        new THREE.MeshBasicMaterial({color: 0xffff00}));

    this.workspace = $('<section class="workspace">');
    this.workspace.viewport = $('<div class="viewport">');
    this.workspace.append(this.workspace.viewport);
}

Editor.prototype.setLevel = function()
{
                    editor.node = parser.node;
                editor.node.object = editor.node.find('> objects');
                editor.node.layout = editor.node.find('> layout');
                editor.node.layout.objects = editor.node.layout.find('> objects');

                editor.file.recent.add(src);

                editor.items.clear();
                editor.items.visible.clear();

                for (var item of parser.items) {
                    var item = new Editor.Item(item.object, item.node);
                    editor.items.add(item);
                    editor.items.visible.add(item);
                }

                for (var object of level.world.objects) {

                }


                level.debug = true;
                level.events.unbind(level.EVENT_START, level.resetPlayer);

                level.camera.camera.far = 5000;
                if (level.checkPoints.length) {
                    level.camera.jumpTo(level.checkPoints[0].pos);
                }

                game.engine.isSimulating = false;
                game.setScene(level);
                game.engine.world.updateTime(0);
}