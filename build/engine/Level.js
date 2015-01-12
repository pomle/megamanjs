Engine.scenes.Level = function()
{
    this.__proto__ = new Engine.Scene();
    var self = this;
    self.collision = new Engine.Collision();
    self.camera.camera.position.z = 120;
    self.startPosition = new THREE.Vector2();

    self.addObject = function(o, x, y)
    {
        o.model.position.x = x === undefined ? o.model.position.x : x;
        o.model.position.y = y === undefined ? o.model.position.y : y;
        self.__proto__.addObject(o);
        self.collision.addObject(o);
        o.setScene(self);
    }

    self.removeObject = function(o)
    {
        self.__proto__.removeObject(o);
        self.collision.removeObject(o);
    }

    self.addPlayer = function(player)
    {
        self.addObject(player, self.startPosition.x, -self.startPosition.y);
        self.camera.follow(player);
    }

    self.setStartPosition = function(x, y)
    {
        self.startPosition.x = x;
        self.startPosition.y = y;
        self.camera.jumpTo(x, -y);
    }

    self.updateTime = function(timeElapsed)
    {
        self.__proto__.updateTime(timeElapsed);
        self.collision.detect();
    }
}

Engine.scenes.Level.Util = {
    'createFromXML': function(xml)
    {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xml, "application/xml");

        var level = new Engine.scenes.Level();

        var background = doc.evaluate('/level/background', doc, null, XPathResult.ANY_TYPE , null).iterateNext();
        if (background) {
            var url = doc.evaluate('@url', background, null, XPathResult.STRING_TYPE).stringValue;
            var w = doc.evaluate('@w', background, null, XPathResult.NUMBER_TYPE).numberValue;
            var h = doc.evaluate('@h', background, null, XPathResult.NUMBER_TYPE).numberValue;

            var texture = Engine.Util.getTexture(url);
            var material = new THREE.MeshLambertMaterial({});
            material.map = texture;
            var model = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(w, h),
                material
            );

            model.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(w/2, -(h/2), 0));
            level.scene.add(model);
        }

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
                    try {
                        var level = Engine.scenes.Level.Util.createFromXML(this.responseText);
                        callback(level);
                    } catch (e) {
                        throw new Error('Could not construct level from ' + url + ', ' + e);
                    }
                    break;
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }
};

Engine.scenes.levels = {};

