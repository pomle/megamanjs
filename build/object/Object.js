Engine.assets.Object = function()
{
    var obstacleY = -40;

    var self = this;
    var isSupported = false;
    self.collision = [];
    self.gravityForce = 0;
    self.speed = new Engine.Vector2();
    self.wantsRemove = false;

    self.addCollisionZone = function(r, x, y)
    {
        self.collision.push({'radius': r, 'x': x, 'y': y});
    }

    self.collides = function(withObject, ourZone, theirZone)
    {
        console.log(withObject, ourZone, theirZone);
    }

    self.isSupported = function()
    {
        return isSupported;
    }

    self.setGravity = function(f)
    {
        self.gravityForce = f;
    }

    self.setModel = function(model)
    {
        self.model = model;
    }

    self.timeShift = function(t)
    {
        self.model.position.x += (self.speed.x * t);
        self.model.position.y += (self.speed.y * t);

        if (!isSupported) {
            self.speed.y -= self.gravityForce;
        }

        if (self.model.position.y < obstacleY + 10) {
            isSupported = true;
        }

        if (self.model.position.y < obstacleY) {
            self.speed.y = 0;
            self.model.position.y = obstacleY;
        }
        else if (self.model.position.y > obstacleY) {
            isSupported = false;
        }
    }
}

Engine.assets.Object.prototype.model = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10, 10),
    new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 'blue'
    }));


Engine.assets.objects = {};
