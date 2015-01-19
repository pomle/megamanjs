Engine.assets.Solid = function()
{
    Engine.assets.Object.call(this);
}

Engine.assets.Solid.prototype = Object.create(Engine.assets.Object.prototype);
Engine.assets.Solid.constructor = Engine.assets.Solid;

Engine.assets.Object.prototype.collides = function(subject, ourZone, theirZone)
{
    if (subject instanceof Engine.assets.objects.Character == false) {
        return;
    }

    if (subject.speed.y) {
        var ourY = this.model.position.y + ourZone.position.y;
        var theirY = subject.model.position.y + theirZone.position.y;

        var edgeDistance = [
            ourZone.geometry.parameters.height / 2,
            theirZone.geometry.parameters.height / 2,
        ];

        if (subject.speed.y < 0) {
            var theirBottom = theirY - edgeDistance[1];
            var ourTop = ourY + edgeDistance[0];
            var handicap = (subject.speed.y / 7);
            if (theirBottom - handicap >= ourTop) {
                subject.model.position.y = ourTop + edgeDistance[1];
                subject.speed.y = 0;
                subject.isSupported = true;
            }
        }
        else {
            subject.model.position.y = ourY - (edgeDistance[0] + edgeDistance[1]);
            subject.speed.y = -(subject.speed.y / 5);
            subject.jumpSpeed = 0;
        }
    }

    if (subject.speed.x) {
        var ourX = this.model.position.x + ourZone.position.x;
        var theirX = subject.model.position.x + theirZone.position.x;

        var edgeDistance = [
            ourZone.geometry.parameters.width / 2,
            theirZone.geometry.parameters.width / 2,
        ];

        var theirLeft = theirX - edgeDistance[1];
        var ourLeft = ourX - edgeDistance[0];
        var theirRight = theirX + edgeDistance[1];
        var ourRight = ourX + edgeDistance[0];

        subject.speed.x = 0;

        if (theirRight > ourLeft) {
            subject.model.position.x = ourLeft + edgeDistance[1];
        } else if (theirLeft < ourRight) {
            subject.model.position.x = ourRight + edgeDistance[1];
        }
    }

    /*
    if (subject.model.position.y < obstacleY + 10) {

    }

    else if (subject.model.position.y > obstacleY) {
        subject.isSupported = false;
    }*/
}
