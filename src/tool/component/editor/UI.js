"use strict";

Editor.UI = function(editor)
{
    this.editor = editor;
    this.console = $('.console');
    this.workspace = $('.workspace');

    this.blankLevelURL = './resource/level-skeleton.xml';
    this.geometryInputDefault = '256x240/16';

    $(window).on('resize', function() {
        if (editor.game) {
            editor.game.adjustResolution();
            editor.game.adjustAspectRatio();
        }
    })
    .on('keydown keyup', function(e) {
        var k = e.which,
            t = e.type,
            c = e.ctrlKey,
            d = (t === 'keydown'),
            u = (t === 'keyup');

        if (k === 27 && d) { // ESC (reset)
            editor.items.deselect();
            $(':input').blur();
            editor.activeMode = editor.modes.view;
        }
        else if ($(e.target).is(':input')) {
            return;
        }
        else {
            if (d && k === 107) { // -
                e.preventDefault();
                editor.camera.zoomOut();
                return;
            }
            if (d && k === 109) { // +
                e.preventDefault();
                editor.camera.zoomIn();
                return;
            }

            editor.activeMode(e);
        }
    });


    this.console.textarea = this.console.find('textarea');
    this.console.find('button[name=generate-xml]').on('click', function(e) {
        e.preventDefault();
        let xml = '<?xml version="1.0" encoding="UTF-8"?>' + editor.getXML();
        xml = vkbeautify.xml(xml);
        editor.ui.console.textarea.val(xml);
    });
    this.console.find('button[name=reload-xml]').on('click', function(e) {
        e.preventDefault();
        let node = $.parseXML(editor.ui.console.textarea.val());
        node = $(node);
        editor.load(node.find('> scene'));
    });

    this.setupWorkspace();
    this.setupFileView();
    this.viewport = this.setupViewport(this.workspace.find('.viewport'));
    this.view = this.setupView(this.workspace.find('.view'));
    this.playback = this.setupPlayback(this.workspace.find('.view'));
    this.item = this.setupItemView(this.workspace.find('.item'));
    this.palette = this.setupPalette(this.workspace.find('.palette'));
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

Editor.UI.prototype.loadLevel = function(url)
{
    this.editor.loadUrl(url).then(() => {
        this.file.recent.add(url);
        this.lastLoadedLevel = url;
        this.applyState();
    });
}

Editor.UI.prototype.setupFileView = function()
{
    /*editor.loader = {
        loadCharacterXml: function(src) {
            var game = editor.game,
                loader = new Game.Loader.XML(game);

            loader.loadObjects(src, function(objects, parser) {
                for (var characterId in objects) {
                    var character = new objects[characterId]();
                    character.position.copy(editor.marker.position);
                    character.position.z = 0;
                    game.scene.world.addObject(character);

                    var characterItem = new Editor.Item.Object(character);
                    editor.items.add(characterItem);
                }
            });
        }
    }*/


    let lastLoadedLevel = '';
    let lastLoadedCharacter = '../resource/characters/Megaman.xml';
    let currentSelection;

    const editor = this.editor;
    const element = $('.level-editor > .file');

    element.new = element.find('.level [name=new]')
        .on('click', () => {
            this.loadLevel(this.blankLevelURL);
        });

    element.load = element.find('.level [name=open]')
        .on('click', () => {
            const url = prompt("Source", lastLoadedLevel);
            if (url !== null && url.length) {
                this.loadLevel(url);
            }
        });

    element.loadCharacter = element.find('[name=loadCharacter]')
        .on('click', () => {
            const url = prompt("Source", lastLoadedCharacter);
            if (url !== null && url.length) {
                this.loadCharacterXml(url);
            }
        });

    element.recent = element.find('.level [name=recent]')
        .on('change', (e) => {
            const value = e.target.value;
            if (currentSelection === value || !value.length || !confirm("Load " + value + "?")) {
                e.preventDefault();
                return;
            }
            currentSelection = value;
            this.loadLevel(value);
        });

    element.recent.add = function(src) {
        var recent = this.get();
        for (;;) {
            var existingIndex = recent.indexOf(src);
            if (existingIndex === -1) {
                break;
            }
            recent.splice(existingIndex, 1);
        }
        recent.unshift(src);
        if (recent.length > 10) {
            recent.pop();
        }
        this.set(recent);
    }
    element.recent.get = () => {
        try {
            var json = editor.storage.getItem('recent');
            var recent = JSON.parse(json);
            var retval = Array.isArray(recent) ? recent : [];
            return retval;
        } catch(e) {
            console.error("Recent parsing failed: " + e.message);
            return [];
        }
    }
    element.recent.set = function(recent)
    {
        var json = JSON.stringify(recent);
        editor.storage.setItem('recent', json);
        this.updatelist();
    }
    element.recent.updatelist = function()
    {
        var recent = this.get();
        if (recent.length) {
            let fragment = document.createDocumentFragment();
            recent.forEach(function(src, index) {
                var opt = document.createElement('option');
                opt.innerHTML = src;
                opt.value = src;
                fragment.appendChild(opt)
            });
            element.recent.html(fragment);
        }
    }
    element.recent.loadLatest = function()
    {
        var recent = this.get();
        if (recent.length) {
            this.updatelist();
            editor.ui.loadLevel(recent[0]);
        }
    };

    this.file = element;
}

Editor.UI.prototype.setupItemView = function(node)
{
    let editor = this.editor,
        element = $(node);

    element.inputs = element.find('.properties input[type=text]');
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
    element.snap = element.find('.properties input[name=snap]').on('change', function() {
        editor.grid.snap = this.checked;
    }).trigger('change');

    element.create = element.find('.create');
    element.create.find('button').on('click', (e) => {
        const type = $(e.target).attr('type');
        this.createItem(type).then(item => {
            console.log(item);
            this.editor.items.insert(item);
        });
    });

    return element;
}

Editor.UI.prototype.createItem = function(type)
{
    const factory = this.editor.componentFactory;
    const layers = this.editor.ui.view.layers;

    if (type === 'cameraPath') {
        layers.cameraPath.on();
        return factory.createCameraPath();
    } else if (type === 'checkpoint') {
        layers.checkpoint.on();
        return factory.createCheckpoint();
    } else if (['deathzone', 'climbable', 'solid'].indexOf(type) > -1) {
        layers.behavior.on();
        const node = factory.nodeFactory.createBehavior(type, {x: 32, y: 16});
        return factory.createBehavior(node);
    } else if (type === 'object') {
        const geometryInput = prompt('Size', this.geometryInputDefault);
        if (!geometryInput) {
            return false;
        }
        this.geometryInputDefault = geometryInput;

        let s = geometryInput.split('/')[0].split('x'),
            m = parseFloat(geometryInput.split('/')[1]);

        let size = {
            x: parseFloat(s[0]),
            y: parseFloat(s[1]),
            sx: 1,
            sy: 1,
        }

        if (m !== undefined) {
            size['sx'] = Math.ceil(size.x / m);
            size['sy'] = Math.ceil(size.y / m);
        }

        layers.object.on();
        const objectNode = factory.nodeFactory.createObject(size);
        return editor.componentFactory.createObject(objectNode);
    }
}

Editor.UI.prototype.setupPalette = function(node)
{
    let editor = this.editor,
        element = $(node);

    element.on('mousedown', '.animation', function(e) {
        if (e.buttons !== 1) {
            return;
        }

        let anim = $(this);
        anim.addClass('selected').siblings().removeClass('selected');

        console.log("Selected anim %s", element.getSelectedAnimation().name);

        setTimeout(function() {
            anim.closest('.palette').addClass('hidden');
        }, 150);
    });

    element.getSelectedAnimation = function()
    {
        let node = this.find('> .animation.selected:first');

        if (node.length === 0) {
            return undefined;
        }

        return {
            name: node.attr('name'),
            uvCoords: node.data('uv-coords'),
        };
    }

    return element;
}

Editor.UI.prototype.setupPlayback = function(node)
{
    let editor = this.editor,
        playback = $(node);

    playback.simulate = playback.find('[name=simulate]');
    playback.simulate.on('change', function() {
        editor.scene.timer.isSimulating = this.checked;
    });

    playback.simulationSpeed = playback.find('[name=simulationSpeed]');
    playback.simulationSpeed.on('change', function() {
        var speed = parseFloat(this.value);
        console.log("Setting simulation speed to", speed);
        editor.scene.timer.simulationSpeed = speed;
    });

    return playback;
}

Editor.UI.prototype.setupView = function(node)
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
        let camera = editor.camera.camera;
        camera.unfollow();
        camera.velocity.set(0,0,0);
    });

    view.camera.obeyPaths = view.camera.find(':input[name=obeyPaths]');
    view.camera.obeyPaths.on('change', function(e) {
        editor.camera.camera.obeyPaths = this.checked;
    });

    view.meta = view.find('.meta :input[type=checkbox]');
    view.meta.on('change', function(e) {
        editor.layers[this.name].visible = this.checked;
    });

    view.layers = view.find('.layers :input[type=checkbox]');
    view.layers.on('change', function(e) {
        let layers = [this.name],
            what = $(this).attr('what'),
            func;

        if (what === 'lock') {
            func = this.checked ? editor.items.unlock : editor.items.lock;
        }
        else if (what === 'show') {
            func = this.checked ? editor.items.show : editor.items.hide;
        }

        for (let layer of layers) {
            if (!editor.items.layers[layer]) {
                console.info("Layer not found %s", layer);
                continue;
            }
            let items = [...editor.items.layers[layer]];
            func.apply(editor.items, items);
        }
    });
    view.layers.each(function() {
        let node = this,
            what = $(this).attr('what');

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
        if (what === 'show') {
            view.layers[this.name] = node;
        }
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

Editor.UI.prototype.setupViewport = function(node)
{
    let editor = this.editor,
        ui = this,
        viewport = $(node);

    viewport.coords = viewport.find('.coords');

    let mouse = {
        pos: new THREE.Vector2(),
        event: undefined,
    }

    let lastPaintedFace = undefined;

    viewport
        .on('mousemove', function(e) {
            if (e.buttons === 2) {
                e.preventDefault();
                let to = new THREE.Vector2((mouse.event.clientX - e.clientX),
                                           -(mouse.event.clientY - e.clientY));
                to.multiplyScalar(editor.camera.position.z / 200);
                editor.camera.nudge(to);
            }
            else if (e.buttons === 1 && editor.activeMode === editor.modes.edit) {
                let selection = editor.items.selected;

                if (e.buttons === 1 && selection.length !== 0) {
                    let pos = viewport.getPositionAtEvent(e.originalEvent),
                        x = (mouse.pos.x - pos.x),
                        y = (mouse.pos.y - pos.y);

                    for (let i = 0, l = selection.length; i !== l; ++i) {
                        let item = selection[i];
                        item.x -= x;
                        item.y -= y;
                    }
                    mouse.pos.copy(pos);
                }
            }
            else if (e.buttons === 1 && editor.activeMode === editor.modes.paint) {
                let item = ui.mouseSelectItem(e.originalEvent, this, [editor.items.selected[0]]);
                if (item) {
                    let faceIndex = item.intersect.faceIndex;
                    faceIndex -= faceIndex % 2;
                    if (faceIndex !== lastPaintedFace) {
                        ui.paintUv(item.item, faceIndex);
                        lastPaintedFace = faceIndex;
                    }
                }
                return;
            }
            mouse.event = e;
        })
        .on('mouseup', function(e) {
            for (let i = 0, l = editor.items.selected.length; i !== l; ++i) {
                let item = editor.items.selected[i];
                if (editor.grid.snap) {
                    editor.grid.snapVector(item);
                }
            }
            lastPaintedFace = undefined;
            editor.camera.centerGrid();
        })
        .on('mousedown', function(e) {
            let pos = viewport.getPositionAtEvent(e.originalEvent);
            mouse.event = e;
            mouse.pos.copy(pos);

            if (e.buttons & 1) {
                viewport.placeMarker(pos);
            }

            if (e.buttons === 1 && editor.activeMode === editor.modes.paint) {
                let item = ui.mouseSelectItem(e.originalEvent, this, [editor.items.selected[0]]);
                if (item) {
                    let faceIndex = item.intersect.faceIndex;
                    ui.paintUv(item.item, faceIndex - faceIndex % 2);
                }
                return;
            }

            if (e.buttons === 1) {
                let item = ui.mouseSelectItem(e.originalEvent, this, editor.items.interactable);
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
        .on('contextmenu', function(e) {
            e.preventDefault();
        })
        .on('click', function(e) {
        })
        .on('dblclick', function(e) {
            e.preventDefault();
            e.stopPropagation();
            let item = ui.mouseSelectItem(e.originalEvent, this, editor.items.interactable);
            if (item && item.item.TYPE === "object") {
                editor.activeMode = editor.modes.paint;
                var mat = item.item.overlay.material;
                mat.color = new THREE.Color(Editor.Colors.overlayPaint);
                mat.needsUpdate = true;
            }
        })
        .on('mousewheel', function(e) {
            if (e.buttons !== 0) {
                return;
            }
            e.preventDefault();
            let d = e.originalEvent.deltaY;
            if (d < 0) {
                editor.camera.zoomOut();
            }
            else {
                editor.camera.zoomIn();
            }
        });

    viewport.placeMarker = function(pos)
    {
        let marker = editor.marker;
        marker.position.copy(pos);
        if (editor.grid.snap) {
            editor.grid.snapVector(marker.position);
        }
        marker.position.z = 0;
        this.coords.find('.x > .value').text(marker.position.x.toFixed(2));
        this.coords.find('.y > .value').text(marker.position.y.toFixed(2));
    }

    viewport.getVectorAtEvent = function(event)
    {
        let bounds = this[0].getBoundingClientRect();
        return new THREE.Vector3((event.layerX / bounds.width) * 2 - 1,
                                -(event.layerY / bounds.height) * 2 + 1,
                                -1);
    }

    viewport.getPositionAtEvent = function(event)
    {
        const camera = editor.camera.realCamera;
        const vector = this.getVectorAtEvent(event);
        vector.unproject(camera);
        vector.sub(camera.position);
        vector.normalize();
        const distance = -(camera.position.z / vector.z);
        return camera.position.clone().add(vector.multiplyScalar(distance));
    }

    return viewport;
}

Editor.UI.prototype.setupWorkspace = function()
{
    const editor = this.editor;
    this.workspace.on('dragover', function (e) {
         e.stopPropagation();
         e.preventDefault();
    });
    this.workspace.on('drop', function (e) {
        e.preventDefault();
        var files = e.originalEvent.dataTransfer.files;
        var file = files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            var i = new Image();
            i.onload = function() {
                var geometry = new THREE.PlaneGeometry(this.width, this.height);
                var texture = new THREE.Texture(this);
                var material = new THREE.MeshBasicMaterial({
                    map: texture,
                    opacity: .5,
                    transparent: true,
                });
                var mesh = new THREE.Mesh(geometry, material);
                var item = new Editor.Item.Mesh(mesh);
                editor.layers.guides.add(mesh);
                editor.items.visible.add(item);
                editor.items.touchable.add(item);
                texture.needsUpdate = true;
            };
            i.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

Editor.UI.prototype.freeCamera = function()
{
    let obey = this.view.camera.obeyPaths,
        unfollow = this.view.camera.unfollow;

    unfollow.trigger('click');
}

Editor.UI.prototype.mouseSelectItem = function(pos, viewport, items)
{
    let editor = this.editor,
        vector = new THREE.Vector3(0,0,0),
        raycaster = new THREE.Raycaster(),
        world = editor.game.scene.world,
        camera = editor.camera.realCamera,
        bounds = viewport.getBoundingClientRect();

    vector.set((event.layerX / bounds.width) * 2 - 1,
               -(event.layerY / bounds.height) * 2 + 1,
               -1); // z = - 1 important!

    vector.unproject(camera);
    vector.sub(camera.position);
    vector.normalize();
    raycaster.set(camera.position, vector);

    var distance = -(camera.position.z / vector.z);
    var pos = camera.position.clone().add(vector.multiplyScalar(distance));

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
                return {item: item, intersect: intersects[0]};
            }
        }
    }
    return false;
}

Editor.UI.prototype.paintUv = function(item, faceIndex)
{
    let paletteItem = editor.ui.palette.getSelectedAnimation();
    if (paletteItem === undefined) {
        return;
    }

    let object = item.object,
        geometry = object.geometry,
        node = item.sourceNode,
        geometryNode = $(node).find('> geometry'),
        faceNode = undefined;

    geometryNode.find('> face').each(function() {
        let node = $(this),
            nodeName = node.attr('animation'),
            indexJSON = node.attr('index'),
            indices = indexJSON ? JSON.parse(indexJSON) : [];

        for (;;) {
            let existingIndex = indices.indexOf(faceIndex);
            if (existingIndex === -1) {
                break;
            }
            console.log("Spliced faceIndex %d at index %d from %s", faceIndex, existingIndex, nodeName);
            indices.splice(existingIndex, 1);
        }

        node.attr('index', JSON.stringify(indices));

        if (nodeName === paletteItem.name) {
            faceNode = node;
        }
    });

    if (faceNode === undefined) {
        faceNode = $('<face>', editor.document).attr({
            'animation': paletteItem.name,
        });
        geometryNode.append(faceNode);
    }

    let indexJSON = faceNode.attr('index'),
        indices = indexJSON ? JSON.parse(indexJSON) : [];

    if (indices.indexOf(faceIndex) === -1) {
        indices.push(faceIndex);
        faceNode.attr('index', JSON.stringify(indices));
    }

    let animators = object.animators,
        selectedAnimator = undefined;
    for (let i = 0, l = animators.length; i !== l; ++i) {
        let animator = animators[i];
        for (;;) {
            let i = animator.indices.indexOf(faceIndex);
            if (i === -1) {
                break;
            }
            console.log("Clear index %d", i);
            animator.indices.splice(i, 1);
        }

        if (animator.name === paletteItem.name) {
            selectedAnimator = animator;
        }
    }

    if (selectedAnimator === undefined) {
        console.log("Adding faceIndex to animator", faceIndex);
        object.geometry.faceVertexUvs[0][faceIndex] = paletteItem.uvCoords[0];
        object.geometry.faceVertexUvs[0][faceIndex+1] = paletteItem.uvCoords[1];
        object.geometry.uvsNeedUpdate = true;
    }
    else {
        console.log("Adding faceIndex to animator", faceIndex);
        selectedAnimator.indices.push(faceIndex);
        selectedAnimator._currentIndex = undefined;
        selectedAnimator.update();
    }
}
