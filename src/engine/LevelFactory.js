Engine.scenes.Level.Util = {
    'createFromXML': function(xml)
    {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xml, "application/xml");

        function parseInteger(value) {
            if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value)) {
                return Number(value);
            }
            return NaN;
        }

        var level = new Engine.scenes.Level();
        level.animators = [];

        function createObjects() {
            var spriteIndex = {};
            var objectIndex = {};

            var spriteSheets = doc.evaluate('/level/sprites', doc, null, XPathResult.ANY_TYPE , null);
            var spriteSheet;
            while (spriteSheet = spriteSheets.iterateNext()) {
                var url = spriteSheet.attributes['url'].value;
                var size = {
                    'w': parseFloat(spriteSheet.attributes['w'].value),
                    'h': parseFloat(spriteSheet.attributes['h'].value)
                };

                var texture = THREE.ImageUtils.loadTexture(url);
                texture.magFilter = THREE.NearestFilter;
                var sprites = doc.evaluate('sprite', spriteSheet, null, XPathResult.ANY_TYPE , null);
                var sprite;
                while (sprite = sprites.iterateNext()) {
                    var bound = doc.evaluate('bounds', sprite, null, XPathResult.ANY_TYPE).iterateNext();
                    var bounds = {
                        'x': parseFloat(bound.attributes['x'].value),
                        'y': parseFloat(bound.attributes['y'].value),
                        'w': parseFloat(bound.attributes['w'].value),
                        'h': parseFloat(bound.attributes['h'].value)
                    };

                    var uvs = [
                        new THREE.Vector2(bounds.x / size.w, (size.h - bounds.y) / size.h),
                        new THREE.Vector2(bounds.x / size.w, (size.h - (bounds.y + bounds.h)) / size.h),
                        new THREE.Vector2((bounds.x + bounds.w) / size.w, (size.h - (bounds.y + bounds.h)) / size.h),
                        new THREE.Vector2((bounds.x + bounds.w) / size.w, (size.h - bounds.y) / size.h),
                    ];

                    var uvMap = [
                        [uvs[0], uvs[1], uvs[3]],
                        [uvs[1], uvs[2], uvs[3]]
                    ];

                    spriteIndex[sprite.attributes['id'].value] = uvMap;
                }

                var objects = doc.evaluate('objects/object', spriteSheet, null, XPathResult.ANY_TYPE , null);
                var object;
                while (object = objects.iterateNext()) {
                    var objectId = object.attributes['id'].value;
                    var size = {
                        'w': parseFloat(object.attributes['w'].value),
                        'h': parseFloat(object.attributes['h'].value)
                    };

                    var geometry = new THREE.PlaneGeometry(size.w, size.h, 1, 1);

                    var frames = [];
                    var frameNodes = doc.evaluate('frame', object, null, XPathResult.ANY_TYPE);
                    var frameNode;
                    while (frameNode = frameNodes.iterateNext()) {
                        frames.push({
                            'ref': frameNode.attributes['sprite'].value,
                            'duration': parseFloat(frameNode.attributes['duration'].value)
                        });
                    }
                    console.log(frames);
                    if (frames.length > 1) {
                        var timeline = new Engine.Timeline();
                        var animator = new Engine.UVAnimator(timeline, geometry);
                        var i;
                        for (i in frames) {
                            timeline.addFrame(spriteIndex[frames[i].ref], frames[i].duration);
                        }
                        level.addTimeline(timeline);
                    }
                    geometry.faceVertexUvs[0] = spriteIndex[frames[0].ref];

                    objectIndex[objectId] = {
                        'size': size,
                        'geometry': geometry,
                        'texture': texture
                    };
                }
            }

            return objectIndex;
        }

        var objectIndex = createObjects();
        console.log(objectIndex);



        //{'geometry': geometry, 'material': material};

        /*
                var geometry = new THREE.PlaneGeometry(spriteBounds.w, spriteBounds.h, 1, 1);
                geometry.faceVertexUvs[0] = [];
                               var material = new THREE.MeshBasicMaterial();
                material.map = texture;
                material.side = THREE.DoubleSide;
        */

        //var levelGeometry = new THREE.Geometry();
        var layoutNodes = doc.evaluate('/level/layout/object', doc, null, XPathResult.ANY_TYPE , null);
        //var materials = [];
        var objectNode;
        while (objectNode = layoutNodes.iterateNext()) {
            var ref = objectNode.attributes['ref'].value;
            var object = objectIndex[ref];

            var material = new THREE.MeshBasicMaterial();
            material.map = object.texture;
            material.side = THREE.DoubleSide;

            var mesh = new THREE.Mesh(object.geometry, material);
            //materials.push(spriteIndex[id].material);
            var pos = {
                'x': parseFloat(objectNode.attributes['x'].value),
                'y': parseFloat(objectNode.attributes['y'].value)
            };

            mesh.position.x = pos.x + (object.size.w / 2);
            mesh.position.y = -(pos.y + (object.size.h / 2));

            var rotate = doc.evaluate('@rotate', objectNode, null, XPathResult.NUMBER_TYPE).numberValue;
            var flip = doc.evaluate('@flip', objectNode, null, XPathResult.STRING_TYPE).stringValue;
            if (isFinite(rotate)) {
                mesh.rotation.z = -(Math.PI/180)*rotate;
            }
            if (flip == 'x') {
                mesh.rotation.x = Math.PI;
            }
            if (flip == 'y') {
                mesh.rotation.y = Math.PI;
            }
            //mesh.updateMatrix();
            //levelGeometry.merge(mesh.geometry, mesh.matrix);
            level.scene.add(mesh);
        }
        //var levelMesh = new THREE.Mesh(levelGeometry, new THREE.MeshFaceMaterial(materials));
        //level.scene.add(levelMesh);


        var checkpoint = doc.evaluate('/level/checkpoints/checkpoint[1]', doc, null, XPathResult.ANY_TYPE , null).iterateNext();
        if (checkpoint) {
            var x = doc.evaluate('@x', checkpoint, null, XPathResult.NUMBER_TYPE).numberValue;
            var y = doc.evaluate('@y', checkpoint, null, XPathResult.NUMBER_TYPE).numberValue;
            level.setStartPosition(x, y);
        }

        return level;
    },
    'loadFromXML': function(url, callback)
    {
        xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function()
        {
            switch(this.readyState) {
                case 4:
                    var level = Engine.scenes.Level.Util.createFromXML(this.responseText);
                    callback(level);
                    break;
            }
        };
        xmlhttp.overrideMimeType('text/xml');
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }
};
