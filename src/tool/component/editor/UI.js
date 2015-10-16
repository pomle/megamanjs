"use strict";

Editor.UI = function(editor, workspace)
{
    this.editor = editor;
    this.workspace = $(workspace);

    $(window).on('resize', function() {
        if (editor.game) {
            editor.game.adjustResolution();
            editor.game.adjustAspectRatio();
        }
    });

    editor.workspace.find(':input').filter('textarea,[type=text]')
        .on('focus', function() {
            editor.activeMode = editor.modes.input;
        });

    this.viewport = this.createViewport(this.workspace.find('.viewport'));
    this.view = this.createView(this.workspace.find('.view'));
    this.playback = this.createPlayback(this.workspace.find('.view'));
    this.item = this.createItem(this.workspace.find('.item'));
}

Editor.UI.prototype.applyState = function()
{
    this.view.meta.trigger('change');
    this.view.layers.trigger('change');
    this.view.camera.obeyPaths.trigger('change');
    this.playback.simulate.trigger('change');
    this.playback.simulate.trigger('change');
    this.playback.simulationSpeed.trigger('change');
}

Editor.UI.prototype.createItem = function(node)
{
    let editor = this.editor,
        element = $(node);

    element.inputs = element.find('.position input[type=text]');
    element.inputs.on('keyup change', function(e) {
        if (!editor.items.selected[0]) {
            return;
        }
        let item = editor.items.selected[0],
            object = element.object,
            value = parseFloat(this.value),
            name = this.name;

        if (!isFinite(value)) {
            return;
        }

        switch (name) {
            case 'x':
            case 'y':
            case 'z':
            case 'w':
            case 'h':
                for (let item of editor.items.selected) {
                    if (item[name] !== undefined) {
                        item[name] = value;
                    }
                }
                break;
        }

        if (editor.grid.snap) {
            editor.grid.snapVector(item);
        }
    });
    element.inputs.clear = function() {
        this.each(function(input) {
            this.value = '';
            this.disabled = true;
        });
    }
    element.inputs.update = function(item) {
        this.each(function(input) {
            let value = item[this.name];
            if (value !== undefined) {
                this.value = value;
                this.disabled = false;
            }
            else {
                this.disabled = true;
            }
        });
    }
    element.snap = element.find('.position input[name=snap]').on('change', function() {
        editor.grid.snap = this.checked;
    }).trigger('change');

    let nodeFactory = editor.nodeFactory,
        nodeManager = editor.nodeManager,
        componentFactory = editor.componentFactory,
        item;

    var geometryInputDefault = '256x240/16';


    element.create = element.find('.create');
    element.create.find('button').on('click', function(e) {
        let button = $(this);
        switch (button.attr('type')) {
            case 'cameraPath':
                let pathNode = nodeFactory.createCameraPath();
                nodeManager.addCameraPath(pathNode);

                item = editor.componentFactory.createCameraPath(pathNode);
                item.moveTo(editor.marker.position);
                editor.ui.view.layers.cameraPath.on();
                break;

            case 'checkpoint':
                let checkpointNode = nodeFactory.createCheckpoint();
                nodeManager.addCheckpoint(checkpointNode);

                item = editor.componentFactory.createCheckpoint(checkpointNode);
                item.moveTo(editor.marker.position);
                editor.ui.view.layers.checkpoint.on();
                break;

            case 'object':
                let geometryInput = prompt('Size', geometryInputDefault);
                if (!geometryInput) {
                    return false;
                }

                let s = geometryInput.split('/')[0].split('x'),
                    m = parseFloat(geometryInput.split('/')[1]) || 16;

                let size = {
                    x: parseFloat(s[0]),
                    y: parseFloat(s[1]),
                }
                size['sx'] = Math.ceil(size.x / m);
                size['sy'] = Math.ceil(size.y / m);

                let objectNode = nodeFactory.createObject(size);
                nodeManager.addObject(objectNode);

                item = editor.componentFactory.createObject(objectNode);

                item.moveTo(editor.marker.position);
                editor.ui.view.layers.object.on();
                break;
        }
    });

    return element;
}

Editor.UI.prototype.createPlayback = function(node)
{
    let editor = this.editor,
        playback = $(node);

    playback.simulate = playback.find('[name=simulate]');
    playback.simulate.on('change', function() {
        editor.game.engine.isSimulating = this.checked;
    });

    playback.simulationSpeed = playback.find('[name=simulationSpeed]');
    playback.simulationSpeed.on('change', function() {
        var speed = parseFloat(this.value);
        console.log("Setting simulation speed to", speed);
        editor.game.engine.simulationSpeed = speed;
    });

    return playback;
}

Editor.UI.prototype.createView = function(node)
{
    let editor = this.editor,
        ui = this,
        view = $(node);

    view.camera = view.find('.camera');

    view.camera.followSelected = view.camera.find('button[name=followSelected]');
    view.camera.followSelected.on('click', function(e) {
        editor.camera.followSelected();
    });

    view.camera.unfollow = view.camera.find('button[name=unfollow]');
    view.camera.unfollow.on('click', function(e) {
        let camera = editor.game.scene.camera;
        camera.unfollow();
        camera.velocity.set(0,0,0);
    });

    view.camera.obeyPaths = view.camera.find(':input[name=obeyPaths]');
    view.camera.obeyPaths.on('change', function(e) {
        editor.game.scene.camera.obeyPaths = this.checked;
    });

    view.meta = view.find('.meta :input[type=checkbox]');
    view.meta.on('change', function(e) {
        editor.layers[this.name].visible = this.checked;
    });

    view.layers = view.find('.layers :input[type=checkbox]');
    view.layers.on('change', function(e) {
        let layers = $(this).attr('layer').split('|'),
            func = this.checked ? editor.items.show : editor.items.hide;

        for (let layer of layers) {
            if (!editor.items.layers[layer]) {
                console.error("Layer not found %s", layer);
                continue;
            }
            let items = [...editor.items.layers[layer]];
            console.log(items);
            func.call(editor.items, items);
        }
    });
    view.layers.each(function() {
        let node = this;
        node.toggle = function() {
            this.checked = !this.checked;
            $(this).trigger('change');
        }
        node.on = function() {
            if (!this.chacked) {
                this.checked = true;
                $(this).trigger('change');
            }
        }
        node.off = function() {
            if (this.chacked) {
                this.checked = false;
                $(this).trigger('change');
            }
        }
        view.layers[this.name] = node;
    })

    view.zoom = view.find('button[name=zoom]').on('click', function(e) {
        let dir = parseFloat($(this).attr('dir'));
        if (dir < 0) {
            editor.camera.zoomOut();
        }
        else {
            editor.camera.zoomIn();
        }
    });

    return view;
}

Editor.UI.prototype.createViewport = function(node)
{
    let editor = this.editor,
        ui = this,
        viewport = $(node);

    viewport.coords = viewport.find('.coords');

    let mouse = {
        pos: new THREE.Vector2(),
        scale: 1,
    }

    viewport
        .on('mousemove', function(e) {
            if (e.buttons & 1) {
                let pos = viewport.getPositionAtEvent(e.originalEvent),
                    x = (mouse.pos.x - pos.x),
                    y = (mouse.pos.y - pos.y);

                if (editor.items.selected.length) {
                    for (let i = 0, l = editor.items.selected.length; i !== l; ++i) {
                        let item = editor.items.selected[i];
                        item.x -= x;
                        item.y -= y;
                    }
                    mouse.pos.copy(pos);
                }
                else {
                    let camera = editor.game.scene.camera.camera;
                    camera.position.x += x;
                    camera.position.y += y;
                }
            }
        })
        .on('mouseup', function(e) {
            for (let i = 0, l = editor.items.selected.length; i !== l; ++i) {
                let item = editor.items.selected[i];
                if (editor.grid.snap) {
                    editor.grid.snapVector(item);
                }
            }
        })
        .on('mousedown', function(e) {
            mouse.pos.copy(viewport.getPositionAtEvent(e.originalEvent));

            if (editor.activeMode === editor.modes.paint) {
                var item = ui.mouseSelectItem(e.originalEvent, this, new Set([editor.items.selected[0]]));

                mouse.scale = item.model.position.z

                if (item) {
                    var intersect = item.intersect,
                        faceIndex = intersect.faceIndex,
                        geometry = intersect.object.geometry;

                    faceIndex -= faceIndex % 2;
                    if (editor.activeMode.pick) {
                        var uvs = geometry.faceVertexUvs[0].slice(faceIndex, faceIndex + 2);
                        editor.clipboard.add('uvs', uvs);
                        editor.activeMode.pick = false;
                    }
                    else if (editor.clipboard.get('uvs')) {
                        var uvs = editor.clipboard.get('uvs');
                        geometry.faceVertexUvs[0].splice(faceIndex, 2, uvs[0], uvs[1]);
                        geometry.uvsNeedUpdate = true;
                    }
                }
            }
            else {
                var item = ui.mouseSelectItem(e.originalEvent, this, editor.items.visible);
                if (item === false) {
                    if (!e.ctrlKey) {
                        editor.activeMode = editor.modes.view;
                        editor.items.deselect();
                    }
                }
                else {
                    console.log("Clicked item", item);
                    /* So far unselected. */
                    if (editor.items.selected.indexOf(item.item) === -1) {
                        if (!e.ctrlKey) {
                            editor.items.deselect();
                        }
                        editor.activeMode = editor.modes.edit;
                        editor.items.select(item.item);
                        if (item.item.object instanceof Game.objects.Character) {
                            editor.game.player.setCharacter(item.item.object);
                            console.log("Selected character", item.item.object);
                        }
                    }
                }
            }
        })
        .on('dblclick', function(e) {
            var item = ui.mouseSelectItem(e.originalEvent, this, editor.items.visible);
            if (item && item.type === "object" && item.item === editor.items.selected[0]) {
                editor.activeMode = editor.modes.paint;
                var mat = item.item.overlay.material;
                mat.color = new THREE.Color(Editor.Colors.overlayPaint);
                mat.needsUpdate = true;
            }
        })
        .on('mousewheel', function(e) {
            e.preventDefault();
            let d = e.originalEvent.deltaY;
            if (d < 0) {
                editor.camera.zoomOut();
            }
            else {
                editor.camera.zoomIn();
            }
        });

    viewport.getPositionAtEvent = function(event)
    {
        let bounds = this[0].getBoundingClientRect(),
            camera = editor.game.scene.world.camera.camera,
            vector = new THREE.Vector3((event.layerX / bounds.width) * 2 - 1,
                                    -(event.layerY / bounds.height) * 2 + 1,
                                    -1);
        vector.unproject(camera);
        vector.sub(camera.position);
        vector.normalize();
        let distance = -(camera.position.z / vector.z);
        return camera.position.clone().add(vector.multiplyScalar(distance));
    }

    return viewport;
}

Editor.UI.prototype.freeCamera = function()
{
    let obey = this.view.camera.obeyPaths,
        unfollow = this.view.camera.unfollow;

    unfollow.trigger('click');
}

Editor.UI.prototype.mouseSelectItem = function(event, viewport, items)
{
    let editor = this.editor,
        vector = new THREE.Vector3(0,0,0),
        raycaster = new THREE.Raycaster(),
        world = editor.game.scene.world,
        camera = world.camera.camera,
        bounds = viewport.getBoundingClientRect(),
        marker = editor.marker;

    vector.set((event.layerX / bounds.width) * 2 - 1,
               -(event.layerY / bounds.height) * 2 + 1,
               -1); // z = - 1 important!

    vector.unproject(camera);
    vector.sub(camera.position);
    vector.normalize();
    raycaster.set(camera.position, vector);

    var distance = -(camera.position.z / vector.z);
    var pos = camera.position.clone().add(vector.multiplyScalar(distance));
    marker.position.copy(pos);

    if (editor.grid.snap) {
        editor.grid.snapVector(marker.position);
    }

    marker.position.z = 0;

    this.viewport.coords.html('X ' + marker.position.x.toFixed(2) +
                             ' Y ' + marker.position.y.toFixed(2)).css({
        left: event.layerX + 20,
        top: event.layerY + 20,
    });

    var intersectables = [];
    items.forEach(function(item) {
        intersectables.push(item.model);
    });

    console.log("Candidate objects", intersectables);
    var intersects = raycaster.intersectObjects(intersectables);

    console.log("Intersecting objects", intersects);
    if (intersects.length !== 0) {
        let closest = intersects[0].object;
        for (let item of items) {
            if (item.model === closest) {
                return {item: item, intersect: closest};
            }
        }
    }
    return false;
}
