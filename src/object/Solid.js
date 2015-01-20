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

    console.log("%s collided", subject);

    var our = {};
    our.prop = {
        x: this.model.position.x + ourZone.position.x,
        y: this.model.position.y + ourZone.position.y,
        w: ourZone.geometry.parameters.width,
        h: ourZone.geometry.parameters.height,
    };
    our.bound = {
        l: our.prop.x - (our.prop.w / 2),
        r: our.prop.x + (our.prop.w / 2),
        t: our.prop.y + (our.prop.h / 2),
        b: our.prop.y - (our.prop.h / 2),
    };

    var their = {};
    their.prop = {
        x: subject.model.position.x + theirZone.position.x,
        y: subject.model.position.y + theirZone.position.y,
        w: theirZone.geometry.parameters.width,
        h: theirZone.geometry.parameters.height,
    };
    their.bound = {
        l: their.prop.x - (their.prop.w / 2),
        r: their.prop.x + (their.prop.w / 2),
        t: their.prop.y + (their.prop.h / 2),
        b: their.prop.y - (their.prop.h / 2),
    };

    if (subject.speed.y && their.bound.r > our.bound.l && their.bound.l < our.bound.r) {
        if (subject.speed.y < 0) {
            subject.model.position.y = our.bound.t + (their.prop.h / 2);
            subject.speed.y = 0;
            subject.isSupported = true;
            subject.isSupportedUntil.x1 = our.bound.l - (their.prop.w / 2);
            subject.isSupportedUntil.x2 = our.bound.r + (their.prop.w / 2);
        }
        else {
            subject.model.position.y = our.bound.b - (their.prop.h / 2);
            subject.speed.y = -(subject.speed.y / 5);
            subject.jumpSpeed = 0;
        }
    }
    else if (subject.speed.x && their.bound.b < our.bound.t && their.bound.t > our.bound.b) {
        if (subject.speed.x > 0) {
            subject.moveSpeed = 0;
            subject.model.position.x = our.bound.l - (their.prop.w / 2);
        }
        else if (subject.speed.x < 0 && their.bound.l < our.bound.r) {
            subject.moveSpeed = 0;
            subject.model.position.x = our.bound.r + (their.prop.w / 2);
        }
    }

    /*
    if (subject.model.position.y < obstacleY + 10) {

    }

    else if (subject.model.position.y > obstacleY) {
        subject.isSupported = false;
    }*/
}
