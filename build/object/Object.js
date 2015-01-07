Engine.assets.Object = function()
{
    var self = this;
    self.collision = [];
    self.gravityForce = 0;
    self.position = new Engine.Vector2();
    self.speed = new Engine.Vector2();

    self.addCollisionZone = function(r, x, y)
    {
        self.collision.push({'radius': r, 'x': x, 'y': y});
    }

    self.collides = function(withObject, ourZone, theirZone)
    {
        console.log(withObject, ourZone, theirZone);
    }

    self.setGravity = function(f)
    {
        self.gravityForce = f;
    }

    self.timeShift = function(t)
    {
        self.model.position.x += (self.speed.x * t);
        self.model.position.y += (self.speed.y * t);
    }
}

Engine.assets.Object.prototype.model = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 'blue'
    }));

Engine.assets.objects = {};
