"use strict";
var editor = {};

$(function() {
    function createPlane(size) {
        let uniqueId = 'object_' + THREE.Math.generateUUID().replace(/-/g, '');

        let objectNode = $('<object/>', editor.node).attr({
            'id': uniqueId,
        });
        let geometryNode = $('<geometry/>', editor.node).attr({
            'type': 'plane',
            'w': size.x,
            'h': size.y,
            'w-segments': size.sx || 1,
            'h-segments': size.sy || 1,
        });
        objectNode.append(geometryNode);
        editor.node.object.append(objectNode);

        let game = editor.game,
            loader = new Game.Loader.XML(game),
            parser = new Game.Loader.XML.Parser.ObjectParser(loader);

        let objectRef = parser.getObject(objectNode);

        let objectInstanceNode = $('<object/>', editor.node).attr({
            'id': uniqueId,
        });

        editor.node.layout.objects.append(objectInstanceNode);

        let item = new Editor.Item(new objectRef(), objectInstanceNode);
        editor.items.insert(item);

        return item;
    }

    function mouseSelectItem(event, viewport, items) {
        console.log(event, viewport, items);
        var vector = new THREE.Vector3(0,0,0),
            raycaster = new THREE.Raycaster(),
            world = editor.game.scene.world,
            camera = world.camera.camera,
            bounds = viewport.getBoundingClientRect();

        vector.set((event.layerX / bounds.width) * 2 - 1,
                   -(event.layerY / bounds.height) * 2 + 1,
                   -1); // z = - 1 important!

        editor.marker.position.copy(vector);

        vector.unproject(camera);
        vector.sub(camera.position);
        vector.normalize();
        raycaster.set(camera.position, vector);

        var distance = -(camera.position.z / vector.z);
        var pos = camera.position.clone().add(vector.multiplyScalar(distance));
        editor.marker.position.copy(pos);
        editor.marker.position.z = 0;

        var intersectables = [];
        items.forEach(function(item) {
            intersectables.push(item.object.model);
        });

        console.log("Insertsect testables", intersectables);
        var intersects = raycaster.intersectObjects(intersectables);
        console.log("Intersecting objects", intersects);
        if (intersects.length !== 0) {
            for (var item of items) {
                if (item.object.model === intersects[0].object) {
                    return {item: item, intersect: intersects[0]};
                }
            }
        }
        return false;
    }

    editor = new Editor();

    var editorNode = $('.level-editor');

    editorNode.find(':input').filter('textarea,[type=text]')
        .on('focus', function() {
            editor.activeMode = editor.modes.input;
        });
    editor.game = undefined;
    editor.workspace = editorNode.find('.workspace');
    editor.workspace.viewport = editor.workspace.find('.viewport')
        .on('click', function(e) {
            if (editor.activeMode === editor.modes.paint) {
                var item = mouseSelectItem(e.originalEvent, this, new Set([editor.items.selected]));

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
                var item = mouseSelectItem(e.originalEvent, this, editor.items.visible);
                console.log("Clicked item", item);
                if (item && item.item !== editor.items.selected) {
                    editor.activeMode = editor.modes.edit;
                    editor.items.select(item.item);
                    if (item.item.object instanceof Game.objects.Character) {
                        editor.game.player.setCharacter(item.item.object);
                        console.log("Selected character", item.item.object);
                    }
                }
            }
        })
        .on('dblclick', function(e) {
            var item = mouseSelectItem(e.originalEvent, this, editor.items.visible);
            if (item && item.item === editor.items.selected) {
                editor.activeMode = editor.modes.paint;
                var mat = item.item.overlay.material;
                mat.color = new THREE.Color(Editor.Colors.overlayPaint);
                mat.needsUpdate = true;
            }
        });

    editor.items.inputs = editorNode.find('.item .properties :input')
        .on('keyup change', function(e) {
            if (!editor.items.selected) {
                return;
            }
            var item = editor.items.selected,
                object = item.object,
                value = parseFloat(this.value),
                name = this.name;

            if (!isFinite(value)) {
                return;
            }

            switch (name) {
                case 'x':
                case 'y':
                case 'z':
                    item[name] = value;
                    break;
            }
        });
    editor.items.inputs.clear = function() {
        this.each(function(input) {
            this.value = '';
        });
    }
    editor.items.inputs.update = function(item) {
        this.each(function(input) {
            this.value = item[this.name];
        });
    }

    editor.storage = localStorage;
    editor.loader = {
        loadCharacterXml: function(src) {
            var game = editor.game,
                loader = new Game.Loader.XML(game);

            loader.loadObjects(src, function(objects, parser) {
                for (var characterId in objects) {
                    var character = new objects[characterId]();
                    character.position.copy(editor.marker.position);
                    character.position.z = 0;
                    game.scene.world.addObject(character);

                    var characterItem = new Editor.Item(character);
                    editor.items.add(characterItem);
                    editor.items.visible.add(characterItem);
                }
            });
        }
    }

    editor.view = editorNode.find('.view');
    editor.view.layers = editor.view.find('.layers').find(':input[type=checkbox]')
        .on('change', function(e) {
            let layers = this.name.split('|'),
                func = this.checked ? editor.items.show : editor.items.hide;

            for (let layer of layers) {
                if (!editor.items.layers[layer]) {
                    console.error("Layer not found %s", layer);
                    continue;
                }
                let items = [...editor.items.layers[layer]];
                func.call(editor.items, items);
            }
        });

    editor.view.find('button[name=zoom]').on('click', function(e) {
        var dir = parseFloat($(this).attr('dir')),
            camera = editor.game.scene.camera.camera,
            multiplier = Math.sqrt(2),
            z = camera.position.z;

        if (dir < 0) {
            z /= multiplier;
        }
        else {
            z *= multiplier;
        }
        camera.position.z = Math.round(z);
    });

    editor.console = editorNode.find('.console');
    editorNode.find('.console button[name=generate-xml]').on('click', function(e) {
        e.preventDefault();
        editor.console.find('textarea').val(vkbeautify.xml(editor.getXML()));
    });


    var workspace = editor.workspace;
    editor.file = editorNode.find('.file');
    editor.file.new = editor.file.find('.level [name=new]')
        .on('click', function() {
            editor.loadLevel('./resource/level-skeleton.xml');
        });

    editor.file.load = editor.file.find('.level [name=open]')
        .on('click', function() {
            var url = prompt("Src");
            if (url !== null && url.length) {
                editor.loadLevel(url, function() {
                    editor.file.recent.add(url);
                });
            }
        });
    editor.file.loadCharacter = editor.file.find('.character [name=open]')
        .on('click', function() {
            var url = prompt("Src", '../game/resource/characters/Megaman.xml');
            if (url !== null && url.length) {
                editor.loader.loadCharacterXml(url);
            }
        });
    editor.file.recent = editor.file.find('.level [name=recent]')
        .on('change', function() {
            if (!this.value.length || !confirm("Load " + this.value + "?")) {
                e.preventDefault();
                return;
            }
            editor.loadLevel(this.value);
        });
    editor.file.recent.add = function(src) {
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
    editor.file.recent.get = function() {
        try {
            var json = editor.storage.getItem('recent');
            console.log("Reading JSON", json);
            var recent = JSON.parse(json);
            var retval = Array.isArray(recent) ? recent : [];
            return retval;
        } catch(e) {
            console.error("Recent parsing failed: " + e.message);
            return [];
        }
    }
    editor.file.recent.set = function(recent)
    {
        var json = JSON.stringify(recent);
        console.log("Setting JSON", json);
        editor.storage.setItem('recent', json);
        this.updatelist();
    }
    editor.file.recent.updatelist = function()
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
            editor.file.recent.html(fragment);
        }
    }

    editor.playback = editorNode.find('.playback');
    editor.playback.toggle = editor.playback.find('[name=toggle]').on('click', function() {
        editor.game.engine.isSimulating = !editor.game.engine.isSimulating;
    });
    editor.playback.simulationSpeed = editor.playback.find('[name=simulation-speed]').on('change', function() {
        var speed = parseFloat(this.value);
        console.log("Setting simulation speed to", speed);
        editor.game.engine.simulationSpeed = speed;
    });

    Game.init(function() {
        var game = new Game();
        editor.debugger = new Game.Debug(game);
        editor.game = game;
        game.attachToElement(editor.workspace.viewport[0]);

        var recent = editor.file.recent.get();
        if (recent.length) {
            editor.file.recent.updatelist();
            editor.loadLevel(recent[0]);
        }
    }, undefined, '../');

    var geometryInput = '256x240/16';
    editor.modes = {
        input: function(e) {
        },
        edit: function(e) {
            if (e.type !== 'keydown') {
                return;
            }

            e.preventDefault();
            if (editor.items.selected === undefined) {
                return;
            }

            var g = editor.grid.clone(),
                i = editor.items.selected,
                p = i;

            if (e.ctrlKey) {
                g.set(1, 1, 1);
            }

            switch (e.which) {
                case 72: // H
                    editor.items.hide(i);
                    editor.items.deselect();
                    break;
                case 38:
                    p.y += g.y;
                    break;
                case 40:
                    p.y -= g.y;
                    break;
                case 39:
                    p.x += g.x;
                    break;
                case 37:
                    p.x -= g.x;
                    break;
                case 46: // DEL
                    editor.items.remove(i);
                    editor.items.deselect();
                    break;
            }
            editor.items.inputs.update(i);
        },
        paint: function(e) {
            if (e.type !== 'keydown') {
                return;
            }

            e.preventDefault();
            switch (e.which) {
                case 80: // P
                    editor.modes.paint.pick = true;
                    break;
            }
            console.log("Pick mode", editor.modes.paint.pick);
        },
        play: function(e) {
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
        },
        view: function(e) {
            if (e.type !== 'keydown') {
                return;
            }

            e.preventDefault();
            var p = editor.game.scene.camera.camera.position,
                a = 64;

            switch (e.which) {
                case 107:
                    p.z /= 2;
                    break;
                case 109:
                    p.z *= 2;
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

                case 65: // A
                    geometryInput = prompt('Size', geometryInput);

                    let s = geometryInput.split('/')[0].split('x'),
                        m = parseFloat(geometryInput.split('/')[1]) || 16;

                    let size = {
                        x: parseFloat(s[0]),
                        y: parseFloat(s[1]),
                    }
                    size['sx'] = Math.ceil(size.x / m);
                    size['sy'] = Math.ceil(size.y / m);

                    let item = createPlane(size);
                    item.moveTo(editor.marker.position);
                    break;
            }
        },
    }
    editor.activeMode = editor.modes.view;

    $(window)
        .on('resize', function(e) {
        }).trigger('resize');

    $(window).on('keydown keyup', function(e) {
        var k = e.which,
            t = e.type,
            c = e.ctrlKey,
            d = (t === 'keydown'),
            u = (t === 'keyup');

        console.log(k, e);

        if (k === 27 && d) { // ESC
            editor.items.deselect();
            editorNode.find(':input').blur();
            editor.workspace.viewport.focus();
            editor.activeMode = editor.modes.view;
        }
        else if (k === 80 && c && d) { // P
            e.preventDefault();
            if (!editor.game.player.character) {
                console.error("No character set");
                return;
            }
            editor.activeMode = editor.modes.play;
            editor.game.engine.isSimulating = true;

        }
        else {
            editor.activeMode(e);
        }
    });


    workspace.on('dragenter', function (e) {
        e.stopPropagation();
        e.preventDefault();
    });
    workspace.on('dragover', function (e) {
         e.stopPropagation();
         e.preventDefault();
    });
    workspace.on('drop', function (e) {
        e.preventDefault();
        if (editor.items.selected === undefined) {
            return;
        }
        var files = e.originalEvent.dataTransfer.files;
        var file = files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            render(e.target.result);
            var i = new Image();
            i.src = e.target.result;
            var canvas = document.createElement('canvas');
            var texture = new THREE.Texture(canvas);
            texture.name = file.name;
            i.onload = function() {
                canvas.width = this.width;
                canvas.height = this.height;
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, this.width, this.height);
                ctx.drawImage(this, 0, 0);
                texture.needUpdate = true;
            };
            selectedObject.material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
            });
            selectedObject.material.needUpdate = true;
        };
        reader.readAsDataURL(file);
    });
});

/*
    workspace.on('drop', function (e) {
        e.preventDefault();
        var files = e.originalEvent.dataTransfer.files;
        var file = files[0];
        canvas.data('url', file.name);
        var reader = new FileReader();
        reader.onload = function(e){
            render(e.target.result);
        };
        reader.readAsDataURL(file);
    });

    function render(src) {
        var image = new Image();
        image.onload = function() {
            var cnv = canvas.get(0);
            cnv.width = this.width;
            cnv.height = this.height;
            var ctx = cnv.getContext("2d");
            ctx.clearRect(0, 0, this.width, this.height);
            ctx.drawImage(image, 0, 0);
        };
        image.src = src;
    }
*/
