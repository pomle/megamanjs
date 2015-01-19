Engine.scenes.Level.Util = {
    'createFromXML': function(xml, baseUrl)
    {
        var baseUrl = baseUrl || '';

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

        var spriteIndex = {};
        var objectIndex = {};

        function expandRange(input, total)
        {
            var values = [];
            var groups, group, ranges, range, i;
            groups = input.split(',');
            while (group = groups.shift()) {
                ranges = group.split('-');
                if (ranges.length == 2) {
                    var lower = parseFloat(ranges[0]);
                    var upper = parseFloat(ranges[1]);
                    for (i = lower; i <= upper; i++) {
                        values.push(i);
                    }
                }
                else if (ranges[0] == '*') {
                    for (i = 0; i < total; i++) {
                        values.push(i+1);
                    }
                }
                else {
                    values.push(parseFloat(ranges[0]));
                }
            }
            return values;
        }

        function getObject(ref)
        {
            if (!objectIndex[ref]) {
                throw new Error("No object reference '" + ref + "'");
            }
            return objectIndex[ref];
        }

        function getSprite(ref)
        {
            if (!spriteIndex[ref]) {
                throw new Error("No sprite '" + ref + "'");
            }
            return spriteIndex[ref];
        }

        function createObjects() {
            var spriteSheets = doc.evaluate('/level/sprites', doc, null, XPathResult.ANY_TYPE , null);
            var spriteSheet;
            while (spriteSheet = spriteSheets.iterateNext()) {
                var url = baseUrl + '/' + spriteSheet.attributes['url'].value;
                var size = {
                    'w': parseFloat(spriteSheet.attributes['w'].value),
                    'h': parseFloat(spriteSheet.attributes['h'].value)
                };

                var texture = Engine.Util.getTexture(url);
                var sprites = doc.evaluate('sprite', spriteSheet, null, XPathResult.ANY_TYPE , null);
                var sprite;
                while (sprite = sprites.iterateNext()) {
                    var bound = doc.evaluate('bounds', sprite, null, XPathResult.ANY_TYPE, null).iterateNext();
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

                    spriteIndex[sprite.attributes['id'].value] = {
                        'uvMap': uvMap,
                        'texture': texture
                    }
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
                    var frameNodes = doc.evaluate('frame', object, null, XPathResult.ANY_TYPE, null);
                    var frameNode;
                    while (frameNode = frameNodes.iterateNext()) {
                        frames.push({
                            'ref': frameNode.attributes['sprite'].value,
                            'duration': parseFloat(frameNode.attributes['duration'].value)
                        });
                    }
                    if (frames.length > 1) {
                        var timeline = new Engine.Timeline();
                        var animator = new Engine.UVAnimator(timeline, geometry);
                        var i;
                        for (i in frames) {
                            timeline.addFrame(getSprite(frames[i].ref).uvMap, frames[i].duration);
                        }
                        level.addTimeline(timeline);
                    }
                    geometry.faceVertexUvs[0] = spriteIndex[frames[0].ref].uvMap;

                    objectIndex[objectId] = {
                        'size': size,
                        'geometry': geometry,
                        'texture': texture
                    };
                }
            }
        }

        createObjects();

        var backgroundNodes = doc.evaluate('/level/layout/background', doc, null, XPathResult.ANY_TYPE , null);
        var backgroundNode;
        level.backgrounds = [];
        while (backgroundNode = backgroundNodes.iterateNext()) {
            var prop = {
                'x': parseFloat(backgroundNode.attributes['x'].value),
                'y': parseFloat(backgroundNode.attributes['y'].value),
                'w': parseFloat(backgroundNode.attributes['w'].value),
                'h': parseFloat(backgroundNode.attributes['h'].value),
                'wx': parseFloat(backgroundNode.attributes['w-segments'].value),
                'hx': parseFloat(backgroundNode.attributes['h-segments'].value)
            }
            var geometry = new THREE.PlaneGeometry(prop.w, prop.h, prop.wx, prop.hx);

            var spriteNodes = doc.evaluate('sprite', backgroundNode, null, XPathResult.ANY_TYPE , null);
            var spriteNode;
            level.uvMaps = [];
            while (spriteNode = spriteNodes.iterateNext()) {
                var ref = spriteNode.attributes['ref'].value;
                var texture = getSprite(ref).texture;
                var material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.FrontSide,
                });
                var uvMap = getSprite(ref).uvMap;

                var segmentNodes = doc.evaluate('segment', spriteNode, null, XPathResult.ANY_TYPE , null);
                var segmentNode;
                while (segmentNode = segmentNodes.iterateNext()) {
                    var range = {
                        x: expandRange(segmentNode.attributes['x'].value, prop.wx),
                        y: expandRange(segmentNode.attributes['y'].value, prop.hx),
                    }

                    var i, j, x, y, faceIndex;
                    for (i in range.x) {
                        x = range.x[i] - 1;
                        for (j in range.y) {
                            y = range.y[j] - 1;

                            faceIndex = (x + (y * prop.wx)) * 2;
                            geometry.faceVertexUvs[0][faceIndex] = uvMap[0];
                            geometry.faceVertexUvs[0][faceIndex+1] = uvMap[1];
                        }
                    }
                }
            }
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = prop.x + (prop.w / 2);
            mesh.position.y = -(prop.y + (prop.h / 2));
            mesh.position.z = 0;
            level.backgrounds.push(mesh);
            level.scene.add(mesh);
        }

        /* FOR MERGING
        //var levelGeometry = new THREE.Geometry();
            //mesh.updateMatrix();
            //levelGeometry.merge(mesh.geometry, mesh.matrix);
        //var levelMesh = new THREE.Mesh(levelGeometry, new THREE.MeshFaceMaterial(materials));
        //level.scene.add(levelMesh);
        */

        var layoutNodes = doc.evaluate('/level/layout/object', doc, null, XPathResult.ANY_TYPE , null);
        //var materials = [];
        var objectNode;
        while (objectNode = layoutNodes.iterateNext()) {
            var ref = objectNode.attributes['ref'].value;
            var object = getObject(ref);

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

            var rotate = doc.evaluate('@rotate', objectNode, null, XPathResult.NUMBER_TYPE, null).numberValue;
            var flip = doc.evaluate('@flip', objectNode, null, XPathResult.STRING_TYPE, null).stringValue;
            if (isFinite(rotate)) {
                mesh.rotation.z = -(Math.PI/180)*rotate;
            }
            if (flip == 'x') {
                mesh.rotation.x = Math.PI;
            }
            if (flip == 'y') {
                mesh.rotation.y = Math.PI;
            }

            level.scene.add(mesh);
        }

        var itemNodes = doc.evaluate('/level/layout/item', doc, null, XPathResult.ANY_TYPE , null);
        var itemNode;
        while (itemNode = itemNodes.iterateNext()) {
            var name = itemNode.attributes['name'].value;
            var Item = new Engine.assets.objects.items[name]();
            Item.model.position.x = parseFloat(itemNode.attributes['x'].value);
            Item.model.position.y = -parseFloat(itemNode.attributes['y'].value);
            level.addObject(Item);
        }


        var solidNodes = doc.evaluate('/level/layout/solids/*', doc, null, XPathResult.ANY_TYPE , null);
        var solidNode;
        var material = new THREE.MeshBasicMaterial({
            color: 'white',
            wireframe: true,
        });
        var exposeSolids = true;
        while (solidNode = solidNodes.iterateNext()) {
            var prop = {
                'x': parseFloat(solidNode.attributes['x'].value),
                'y': parseFloat(solidNode.attributes['y'].value),
                'w': parseFloat(solidNode.attributes['w'].value),
                'h': parseFloat(solidNode.attributes['h'].value),
            }

            var geometry = new THREE.PlaneGeometry(prop.w, prop.h);
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.x = prop.x + (prop.w / 2);
            mesh.position.y = -(prop.y + (prop.h / 2));
            mesh.position.z = exposeSolids ? 1 : -1;

            var solid = new Engine.assets.Solid();
            solid.setModel(mesh);
            solid.addCollisionGeometry(geometry);

            level.addObject(solid);
        }

        var checkpoint = doc.evaluate('/level/checkpoints/checkpoint[1]', doc, null, XPathResult.ANY_TYPE , null).iterateNext();
        if (checkpoint) {
            var x = doc.evaluate('@x', checkpoint, null, XPathResult.NUMBER_TYPE, null).numberValue;
            var y = doc.evaluate('@y', checkpoint, null, XPathResult.NUMBER_TYPE, null).numberValue;
            level.setStartPosition(x, y);
        }

        return level;
    },
    'loadFromXML': function(url, callback)
    {
        var baseUrl = url.split('/').slice(0, -1).join('/');
        xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function()
        {
            switch(this.readyState) {
                case 4:
                    var level = Engine.scenes.Level.Util.createFromXML(this.responseText, baseUrl);
                    callback(level);
                    break;
            }
        };
        xmlhttp.overrideMimeType('text/xml');
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }
};
