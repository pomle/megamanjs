"use strict";
$(function() {
    function loadLevel(src)
    {
        editor.loadUrl(src, function() {
            editor.file.recent.add(src);
            editor.ui.applyState();
        });
    }


    var editor = new Editor();
    editor.workspace = $('.workspace');
    editor.ui = new Editor.UI(editor, editor.workspace);

    editor.console = $('.console');
    editor.console.find('button[name=generate-xml]').on('click', function(e) {
        e.preventDefault();
        editor.console.find('textarea').val(vkbeautify.xml(editor.getXML()));
    });
    editor.console.find('button[name=reload-xml]').on('click', function(e) {
        e.preventDefault();
        let node = $.parseXML(editor.console.find('textarea').val());
        node = $(node);
        editor.load(node.find('> scene'));
    });



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

                    var characterItem = new Editor.Item.Object(character);
                    editor.items.add(characterItem);
                }
            });
        }
    }


    editor.file = $('.file');
    editor.file.new = editor.file.find('.level [name=new]')
        .on('click', function() {
            editor.loadUrl('./resource/level-skeleton.xml');
        });

    editor.file.load = editor.file.find('.level [name=open]')
        .on('click', function() {
            var url = prompt("Src");
            if (url !== null && url.length) {
                loadLevel(url);
            }
        });
    editor.file.loadCharacter = editor.file.find('[name=loadCharacter]')
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
            loadLevel(this.value);
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

    Game.init(function() {
        var game = new Game();
        editor.attachGame(game);

        var recent = editor.file.recent.get();
        if (recent.length) {
            editor.file.recent.updatelist();
            loadLevel(recent[0]);
        }
    }, undefined, '../');

    $(window)
        .on('resize', function(e) {
        }).trigger('resize');

    $(window)
        .on('keydown keyup', function(e) {
            var k = e.which,
                t = e.type,
                c = e.ctrlKey,
                d = (t === 'keydown'),
                u = (t === 'keyup');

            console.log(k, e);

            if (k === 27 && d) { // ESC
                editor.items.deselect();
                $(':input').blur();
                editor.ui.viewport.focus();
                editor.activeMode = editor.modes.view;
            }
            else if (k === 80 && c && d) { // P
                e.preventDefault();
                if (!editor.game.player.character) {
                    console.error("No character set");
                    return;
                }
                editor.activeMode = editor.modes.play;
                editor.ui.playback.simulate.prop('checked', true).trigger('change');
            }
            else {
                editor.activeMode(e);
            }
        })

    editor.workspace.on('dragenter', function (e) {
        e.stopPropagation();
        e.preventDefault();
    });
    editor.workspace.on('dragover', function (e) {
         e.stopPropagation();
         e.preventDefault();
    });
    editor.workspace.on('drop', function (e) {
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

    window.editor = editor;
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
