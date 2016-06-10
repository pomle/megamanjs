"use strict";
$(function() {
    function loadLevel(src)
    {
        editor.loadUrl(src)
            .then(() => {
                editor.file.recent.add(src);
                lastLoadedLevel = src;
                editor.ui.applyState();
            });
    }

    var editor = new Editor();

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

    var lastLoadedLevel = '',
        lastLoadedCharacter = '';

    lastLoadedCharacter = '../game/resource/characters/Megaman.xml';

    editor.file.load = editor.file.find('.level [name=open]')
        .on('click', function() {
            var url = prompt("Src", lastLoadedLevel);
            if (url !== null && url.length) {
                loadLevel(url);
            }
        });
    editor.file.loadCharacter = editor.file.find('[name=loadCharacter]')
        .on('click', function() {
            var url = prompt("Src", lastLoadedCharacter);
            if (url !== null && url.length) {
                editor.loader.loadCharacterXml(url);
            }
        });
    editor.file.recent = editor.file.find('.level [name=recent]')
        .on('change', (function() {
            var currentSelection;
            return function(e) {
                if (currentSelection === this.value || !this.value.length || !confirm("Load " + this.value + "?")) {
                    e.preventDefault();
                    return;
                }
                currentSelection = this.value;
                var src = this.value;
                setTimeout(function() {
                    loadLevel(src);
                }, 0);
            }
        })());
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

    editor.ui.workspace.on('dragover', function (e) {
         e.stopPropagation();
         e.preventDefault();
    });
    editor.ui.workspace.on('drop', function (e) {
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

    editor.attachGame(new Game());

    var recent = editor.file.recent.get();
    /*if (recent.length) {
        editor.file.recent.updatelist();
        loadLevel(recent[0]);
    }*/
    loadLevel('../resource/Intro.xml');

    window.editor = editor;
});
