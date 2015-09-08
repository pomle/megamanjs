"use strict";
var editor = {};

$(function() {
    function mouseSelectItem(e) {
        var vector = new THREE.Vector3(0,0,0),
            raycaster = new THREE.Raycaster(),
            world = editor.game.scene.world,
            camera = world.camera.camera,
            event = e.originalEvent,
            viewport = $(this);

        vector.set((event.layerX / viewport.width()) * 2 - 1,
                   -(event.layerY / viewport.height()) * 2 + 1,
                   -1); // z = - 1 important!

        vector.unproject(camera);
        raycaster.set(camera.position, vector.sub(camera.position).normalize());

        var intersectables = [];
        editor.items.visible.forEach(function(item) {
            intersectables.push(item.object.model);
        });

        var intersects = raycaster.intersectObjects(intersectables);
        if (intersects.length !== 0) {
            for (var item of editor.items) {
                if (item.object.model === intersects[0].object) {
                    editor.items.select(item);
                    return true;
                }
            }
        }
        return false;
    }

    editor = $('.level-editor');
    editor.document = $('<scene type="level"/>');
    editor.find(':input').filter('textarea,[type=text]')
        .on('focus', function() {
            editor.activeMode = editor.modes.input;
        });
    editor.game = undefined;
    editor.workspace = editor.find('.workspace');
    editor.workspace.viewport = editor.workspace.find('.viewport')
        .on('click', mouseSelectItem)
        .on('dblclick', function(e) {
            var item = mouseSelectItem(e);
            console.log(item);

        });
    editor.workspace.viewport.cameraPaths = {
        show: function() {
            editor.debugger.toggleCameraPaths(true);
        },
        hide: function() {
            editor.debugger.toggleCameraPaths(false);
        },
    }
    editor.workspace.viewport.collisionZones = {
        show: function() {
            for (var item of editor.items) {
                for (var i in item.object.collision) {
                    var zone = object.collision[i];
                    zone.position.z = -object.position.z + .1;
                    var node = item.node.find('> collision')
                    var zoneItem = new editor.item({model: zone, node})
                    object.model.add(zone);
                }
            }

            editor.debugger.toggleCollisionZones(true);
        },
        hide: function() {
            editor.debugger.toggleCollisionZones(false);
        },
    }

    editor.item = function(object, node)
    {
        this.node = $(node);
        this.object = object;
        this.update = function() {
            this.node.attr('x', this.object.position.x + this.object.origo.x);
            this.node.attr('y', -(this.object.position.y + this.object.origo.y));
            this.node.attr('z', this.object.position.z);
            console.log(this.node[0]);
        }
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
            item.object.model.geometry.clone(),
            new THREE.MeshBasicMaterial({color: '#00ff00', wireframe: true}));
        item.overlay.position.z = .001;
        item.object.model.add(item.overlay);

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
        if (this.has(item)) {
            console.error("Item already in scene", item);
        }
        editor.game.scene.world.addObject(item.object);
        this.add(item);
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
                editor.file.recent.add(src);

                for (var item of parser.items) {
                    var item = new editor.item(item.object, item.node);
                    item.update();
                    editor.items.add(item);
                    editor.items.visible.add(item);
                }

                level.debug = true;
                level.events.unbind(level.EVENT_START, level.resetPlayer);
                level.world.camera.camera.far = 5000;
                game.engine.isSimulating = false;
                game.setScene(level);
                game.engine.world.updateTime(0);
            });
        },
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
    editor.file.load = editor.file.find('[name=open]')
        .on('click', function() {
            var url = prompt("Src");
            if (url !== null && url.length) {
                editor.loader.loadLevelXml(url);
            }
        });
    editor.file.recent = editor.file.find('[name=recent]')
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
        game.player.setCharacter(new Game.objects.Character());

        var recent = editor.file.recent.get();
        if (recent.length) {
            editor.loader.loadLevelXml(recent[0]);
        }
    }, undefined, '../');

    editor.modes = {
        input: function(e) {
        },
        edit: function(e) {
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
        view: function(e) {
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
            }
        },
    }
    editor.activeMode = editor.modes.view;

    $(window)
        .on('resize', function(e) {
        }).trigger('resize');

    var geometryInput = '256x240/16';
    $(window).on('keydown', function(e) {
        console.log(e.which, e);
        switch (e.which) {
            case 27: // ESC
                editor.items.deselect();
                editor.find(':input').blur();
                editor.workspace.viewport.focus();
                break;

            case 65:
                geometryInput = prompt('Size', geometryInput);
                var s = geometryInput.split('/')[0].split('x');
                var m = parseFloat(geometryInput.split('/')[1]) || 16;
                var size = {
                    x: parseFloat(s[0]),
                    y: parseFloat(s[1]),
                }
                size['sx'] = Math.ceil(size.x / m);
                size['sy'] = Math.ceil(size.y / m);

                var mesh = new THREE.Mesh(
                    new THREE.PlaneBufferGeometry(size.x, size.y, size.sx, size.sy),
                    new THREE.MeshBasicMaterial({color: 'blue', wireframe: true})
                );
                mesh.position.x = camera.position.x;
                mesh.position.y = camera.position.y;
                activeLayer.push(mesh);
                scene.add(mesh);
                //selectedObject = mesh;
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
