"use strict";
var editor = {};

$(function() {
    editor = $('.level-editor');
    editor.game = undefined;
    editor.workspace = editor.find('.workspace');
    editor.workspace.viewport = editor.workspace.find('.viewport')
        .on('click', function(e) {
            var vector = new THREE.Vector3(0,0,0),
                raycaster = new THREE.Raycaster(),
                world = editor.game.scene.world,
                camera = world.camera.camera,
                viewport = $(this);

            vector.set((event.layerX / viewport.width()) * 2 - 1,
                       -(event.layerY / viewport.height()) * 2 + 1,
                       -1); // z = - 1 important!

            console.log(vector);

            vector.unproject(camera);
            raycaster.set(camera.position, vector.sub(camera.position).normalize());
            var intersects = raycaster.intersectObjects(world.scene.children);

            if (intersects.length !== 0) {
                for (var object of world.objects) {
                    if (object.model === intersects[0].object) {
                        editor.selectObject(object);
                        return true;
                    }
                }
            }
            return false;
        });

    editor.selectedObject = undefined;
    editor.deselectObject = function() {
        this.activeMode = this.modes.view;
        this.selectedObject = undefined;
    }
    editor.selectObject = function(object) {
        this.selectedObject = object;
        this.activeMode = this.modes.edit;
        console.log("Selected object", object);

    }
    editor.storage = localStorage;
    editor.loader = {
        loadLevelXml: function(src) {
            var game = editor.game,
                loader = new Game.Loader.XML(game);
            loader.loadLevel(src, function(level) {
                editor.file.recent.add(src);

                console.log(level);
                level.debug = true;
                level.events.unbind(level.EVENT_START, level.resetPlayer);
                game.engine.isSimulating = false;
                game.setScene(level);
                game.engine.world.updateTime(0);
            });
        },
    }

    var workspace = editor.workspace;
    editor.file = editor.find('.file');
    editor.file.load = editor.file.find('[name=open]')
        .on('click', function() {
            var url = prompt("Src");
            if (url.length) {
                editor.loadLevelXml(url);
            }
        });
    editor.file.recent = editor.file.find('[name=recent]')
        .on('change', function() {
            if (!this.value.length || !confirm("Load " + this.value + "?")) {
                e.preventDefault();
                return;
            }
            editor.loadLevelXml(this.value);
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

    editor.object = {
        remove: function(object) {
            editor.game.scene.world.removeObject(object);
        }
    }

    editor.modes = {
        edit: function(e) {
            if (editor.selectedObject === undefined) {
                return;
            }

            var a = e.ctrlKey ? 1 : 16,
                p = editor.selectedObject.position;
            switch (e.which) {
                case 9: // TAB
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
                case 46: // DEL
                    editor.object.remove(editor.selectedObject);
                    editor.selectedObject = undefined;
                    break;
            }
        },
        view: function(e) {
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
        e.preventDefault();
        console.log(e.which, e);
        switch (e.which) {
            case 27:
                editor.deselectObject();
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

                console.log(size);
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
        if (selectedObject === undefined) {
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
