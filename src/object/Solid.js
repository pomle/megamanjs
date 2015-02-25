Engine.assets.Solid = function()
{
    Engine.assets.Object.call(this);
}

Engine.assets.Solid.prototype = Object.create(Engine.assets.Object.prototype);
Engine.assets.Solid.constructor = Engine.assets.Solid;

Engine.assets.Solid.prototype.collides = function(subject, ourZone, theirZone)
{
    if (subject instanceof Engine.assets.objects.Character == false) {
        return;
    }

    var our = new Engine.Collision.CollisionProperty(this.model, ourZone);
    var their = new Engine.Collision.CollisionProperty(subject.model, theirZone);

    if (subject.speed.y && their.r > our.l && their.l < our.r) {
        if (subject.speed.y < 0) {
            subject.model.position.y = our.t + (their.h / 2);
            subject.speed.y = 0;
            subject.isSupported = true;
            subject.isSupportedUntil.x1 = our.l - (their.w / 2);
            subject.isSupportedUntil.x2 = our.r + (their.w / 2);
        }
        else {
            subject.model.position.y = our.b - (their.h / 2);
            subject.jumpEnd();
            subject.speed.y = -(subject.speed.y / 5);
        }
    }
    else if (subject.speed.x && their.b < our.t && their.t > our.b) {
        var inhibitor = {
            'y1': our.t + (their.h / 2),
            'y2': our.b - (their.h / 2),
        };
        if (subject.speed.x > 0) {
            subject.moveSpeed = 0;
            subject.model.position.x = our.l - (their.w / 2);
            subject.movementInhibitor.r = inhibitor;
        }
        else {
            subject.moveSpeed = 0;
            subject.model.position.x = our.r + (their.w / 2);
            subject.movementInhibitor.l = inhibitor;
        }
    }
}

Engine.assets.obstacles = {};
