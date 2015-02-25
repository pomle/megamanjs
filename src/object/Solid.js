Engine.assets.Solid = function()
{
    Engine.assets.Object.call(this);
    this.buffer = new THREE.Vector2();
}

Engine.assets.Solid.prototype = Object.create(Engine.assets.Object.prototype);
Engine.assets.Solid.constructor = Engine.assets.Solid;

Engine.assets.Solid.prototype.TOP = 't';
Engine.assets.Solid.prototype.BOTTOM = 'b';
Engine.assets.Solid.prototype.LEFT = 'l';
Engine.assets.Solid.prototype.RIGHT = 'r';

Engine.assets.Solid.prototype.collides = function(subject, ourZone, theirZone)
{
    if (subject instanceof Engine.assets.objects.Character == false) {
        return;
    }

    var our = new Engine.Collision.CollisionProperty(this.model, ourZone);
    var their = new Engine.Collision.CollisionProperty(subject.model, theirZone);

    /*this.buffer.x = subject.speed.x * subject.deltaTime;
    this.buffer.y = subject.speed.y * subject.deltaTime;*/

    var distances = {};
        distances[this.TOP] = Math.abs(their.b - our.t);
        distances[this.BOTTOM] = Math.abs(their.t - our.b);
        distances[this.LEFT] = Math.abs(their.r - our.l);
        distances[this.RIGHT] = Math.abs(their.l - our.r);

    var min, n;
    for (var d in distances) {
        if (min === undefined || distances[d] < min) {
            min = distances[d];
            n = d;
        }
    }

    switch (n) {
        case this.TOP:
            subject.model.position.y = our.t + (their.h / 2);
            subject.momentumSpeed.copy(this.speed);
            //subject.isSupported = true;
            break;
        case this.BOTTOM:
            subject.model.position.y = our.b - (their.h / 2);
            subject.momentumSpeed.y = this.momentumSpeed.y - (subject.momentumSpeed.y / 5);
            subject.jumpEnd();
            break;
        case this.LEFT:
            subject.model.position.x = our.l - (their.w / 2);
            //subject.momentumSpeed.x = 0;
            subject.moveSpeed = 0;
            break;
        case this.RIGHT:
            subject.model.position.x = our.r + (their.w / 2);
            //subject.momentumSpeed.x = 0;
            subject.moveSpeed = 0;
            break;
    }
}

Engine.assets.obstacles = {};
