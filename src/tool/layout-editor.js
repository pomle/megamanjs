"use strict";
var editor = {};

$(function() {
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

        console.log(pos);

        var intersectables = [];
        items.forEach(function(item) {
            intersectables.push(item.object.model);
        });

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

    editor = $('.level-editor');
    editor.clipboard = [];
    editor.clipboard.add = function(type, data) {
        this.unshift({type: type, data: data});
    }
    editor.clipboard.get = function(type) {
        for (var i = 0, l = this.length; i !== l; ++i) {
            if (this[i].type === type) {
                return this[i];
            }
        }
        return undefined;
    }
    editor.marker = {
        position: new THREE.Vector3(),
    }
    editor.document = $('<scene type="level"/>');
    editor.find(':input').filter('textarea,[type=text]')
        .on('focus', function() {
            editor.activeMode = editor.modes.input;
        });
    editor.game = undefined;
    editor.workspace = editor.find('.workspace');
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
                        var uvs = editor.clipboard.get('uvs').data;
                        geometry.faceVertexUvs[0].splice(faceIndex, 2, uvs[0], uvs[1]);
                        geometry.uvsNeedUpdate = true;
                    }
                }
            }
            else {
                var item = mouseSelectItem(e.originalEvent, this, editor.items.visible);
                console.log("Clicked item", item);
                if (item && item.item !== editor.items.selected) {
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
                mat.color = new THREE.Color(0, 0, 1);
                mat.needsUpdate = true;
            }
        });


    editor.item = function(object, node, constructor)
    {
        this.ref = constructor;
        this.node = $(node);
        this.object = object;

        var _this = this;
        this.update = function() {
            _this.node.attr('x', _this.object.position.x + _this.object.origo.x);
            _this.node.attr('y', -(_this.object.position.y + _this.object.origo.y));
            _this.node.attr('z', _this.object.position.z);
        }
    }
    editor.item.prototype.clone = function()
    {
        var node = this.node.clone();
        this.node.parent().append(node);
        return new editor.item(new this.ref(), node, this.ref);
    }

    editor.item.properties = editor.find('.item .properties');
    editor.item.properties.inputs = editor.item.properties.find(':input')
        .on('keyup', function(e) {
            if (!editor.items.selected) {
                return;
            }
            var item = editor.items.selected,
                object = item.object,
                value = parseFloat(this.value);
            if (!isFinite(value)) {
                return;
            }
            switch (this.name) {
                case 'x':
                    object.position.x = value - object.origo.x;
                    break;
                case 'y':
                    object.position.y = -(value + object.origo.y);
                    break;
                case 'z':
                    object.position.z = value;
                    break;
            }
            item.update();
        });
    editor.item.properties.inputs.clear = function() {
        this.each(function(input) {
            this.value = '';
        });
    }
    editor.item.properties.inputs.update = function(item) {
        this.each(function(input) {
            this.value = item.node.attr(this.name);
        });
    }
    editor.items = new Set();
    editor.items.visible = new Set();
    editor.items.selected = undefined;
    editor.items.deselect = function() {
        editor.activeMode = editor.modes.view;
        if (this.selected) {
            var item = this.selected;
            if (item.overlay) {
                item.object.model.remove(item.overlay);
                item.overlay = undefined;
            }
        }

        this.selected = undefined;
        editor.item.properties.inputs.clear();
        console.log("Selected item", this.selected);
    }
    editor.items.select = function(item) {
        this.deselect();
        this.selected = item;
        editor.activeMode = editor.modes.edit;

        item.overlay = new THREE.Mesh(
            item.object.model.geometry,
            new THREE.MeshBasicMaterial({color: '#00ff00', wireframe: true}));
        item.object.model.add(item.overlay);
        item.overlay.translateZ(.1);

        editor.item.properties.inputs.update(item);
        console.log("Selected item", this.selected);
    }
    editor.items.hide = function(item) {
        if (this.selected === item) {
            this.deselect();
        }
        editor.game.scene.world.scene.remove(item.object.model);
        editor.items.visible.delete(item);
        console.log("Hid item", item);
    }
    editor.items.show = function(item) {
        editor.game.scene.world.scene.add(item.object.model);
        editor.items.visible.add(item);
        console.log("Exposed item", item);
    }
    editor.items.insert = function(item)
    {
        editor.game.scene.world.addObject(item.object);
        this.add(item);
        this.visible.add(item);
    }
    editor.items.remove = function(item)
    {
        if (!this.has(item)) {
            console.error("Item not found", item);
        }
        editor.game.scene.world.removeObject(item.object);
        this.delete(item);
    }

    editor.storage = localStorage;
    editor.loader = {
        loadLevelXml: function(src) {
            var game = editor.game,
                loader = new Game.Loader.XML(game);

            loader.loadLevel(src, function(level, parser) {
                editor.node = parser.node;
                editor.node.object = editor.node.find('> objects');
                editor.node.layout = editor.node.find('> layout');
                editor.node.layout.objects = editor.node.layout.find('> objects');

                editor.file.recent.add(src);

                editor.items.clear();
                editor.items.visible.clear();

                for (var item of parser.items) {
                    var item = new editor.item(item.object, item.node, item.constructor);
                    item.update();
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
            });
        },
        loadCharacterXml: function(src) {
            var game = editor.game,
                loader = new Game.Loader.XML(game);

            loader.loadObjects(src, function(objects, parser) {
                for (var characterId in objects) {
                    var character = new objects[characterId]();
                    character.position.copy(editor.marker.position);
                    character.position.z = 0;
                    game.scene.world.addObject(character);

                    var characterItem = new editor.item(character);
                    editor.items.add(characterItem);
                    editor.items.visible.add(characterItem);
                }
            });
        }
    }

    editor.view = editor.find('.view');
    editor.view.layers = editor.view.find('.layers');
    editor.view.layers.collision = editor.view.layers.find(':input[name=collision-zones]');
    editor.view.layers.collision.on('change', function() {
        editor.debugger.toggleCollisionZones($(this).prop('checked'));
    });
    editor.view.layers.cameraPaths = editor.view.layers.find(':input[name=camera-paths]');
    editor.view.layers.cameraPaths.on('change', function() {
        editor.debugger.toggleCameraPaths($(this).prop('checked'));
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

    editor.console = editor.find('.console');
    editor.find('.console button[name=generate-xml]').on('click', function(e) {
        e.preventDefault();
        editor.console.find('textarea').val(vkbeautify.xml(editor.node[0].outerHTML));
    });


    var workspace = editor.workspace;
    editor.file = editor.find('.file');
    editor.file.load = editor.file.find('.level [name=open]')
        .on('click', function() {
            var url = prompt("Src");
            if (url !== null && url.length) {
                editor.loader.loadLevelXml(url);
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
            editor.loader.loadLevelXml(this.value);
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

    editor.playback = editor.find('.playback');
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
            editor.loader.loadLevelXml(recent[0]);
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

            var a = e.ctrlKey ? 1 : 16,
                i = editor.items.selected,
                p = i.object.position;
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
                case 46: // DEL
                    editor.items.remove(i);
                    editor.items.deselect();
                    break;
            }
            i.update();
            editor.item.properties.inputs.update(i);
        },
        paint: function(e) {
            if (e.type !== 'keydown') {
                return;
            }

            e.preventDefault();
            console.log("Pick mode", editor.modes.paint.pick);
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
                case 80: // P
                    if (!editor.game.player.character) {
                        console.error("No character set");
                        break;
                    }
                    editor.activeMode = editor.modes.play;
                    editor.game.engine.isSimulating = true;
                    break;
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

                    let uniqueId = 'object_' + THREE.Math.generateUUID().replace(/-/g, '');

                    let objectNode = $('<object/>', editor.node).attr({
                        'id': uniqueId,
                    });
                    let geometryNode = $('<geometry/>', editor.node).attr({
                        'type': 'plane',
                        'w': size.x,
                        'h': size.y,
                        'w-segments': size.sx,
                        'h-segments': size.sy,
                    });
                    objectNode.append(geometryNode);
                    editor.node.object.append(objectNode);

                    let game = editor.game,
                        loader = new Game.Loader.XML(game),
                        parser = new Game.Loader.XML.Parser.ObjectParser(loader);

                    let objectRef = parser.getObject(objectNode);

                    let objectInstanceNode = $('<object/>', editor.node).attr({
                        'id': uniqueId,
                        'x': editor.marker.position.x,
                        'x': -editor.marker.position.y,
                    });

                    editor.node.layout.objects.append(objectInstanceNode);

                    let item = new editor.item(new objectRef(), objectInstanceNode, objectRef);
                    editor.items.insert(item);
                    break;
            }
        },
    }
    editor.activeMode = editor.modes.view;

    $(window)
        .on('resize', function(e) {
        }).trigger('resize');

    $(window).on('keydown keyup', function(e) {
        console.log(e.which, e);
        switch (e.which) {
            case 27: // ESC
                editor.items.deselect();
                editor.find(':input').blur();
                editor.workspace.viewport.focus();
                editor.activeMode = editor.modes.view;
                break;

            default:
                editor.activeMode(e);
                break;
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
