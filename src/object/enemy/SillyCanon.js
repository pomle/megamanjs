Engine.assets.objects.characters.SillyCanon = function(target)
{
    Engine.assets.objects.Character.call(this);

    var model = Engine.Util.createSprite('enemies/sillycanon.gif', 32, 32);
    this.sprites = new Engine.SpriteManager(model, 32, 32 , 192, 32);

    var idle = this.sprites.addSprite('idle');
    idle.addFrame(0, 0);

    this.sprites.selectSprite('idle');
    this.sprites.applySprite();

    this.setModel(model);
    this.addCollisionRect(16, 20, 0, -5);

    this.health = new Engine.assets.Energy(10);

    this.setDirection(-1);
    this.setGravity(0);

    this.coolDown = .8;
    this.waitForShot = 0;
    this.target = target;

    this.timeAIUpdated = null;

    // Degrees
    this.far = 200;
    this.near = 0;
    this.aimFar = 150;
    this.aimNear = 95;
    this.aimingAngle = null;
}

Engine.assets.objects.characters.SillyCanon.prototype = Object.create(Engine.assets.objects.Character.prototype);
Engine.assets.objects.characters.SillyCanon.constructor = Engine.assets.objects.characters.SillyCanon;

Engine.assets.objects.characters.SillyCanon.prototype.fire = function()
{
    if (this.waitForShot > 0) {
        return;
    }

    var projectile = new Engine.assets.projectiles.SillyShot();
    projectile.setEmitter(this);
    projectile.speed.x = projectile.velocity * Math.cos(Math.RAD * this.aimingAngle);
    projectile.speed.y = projectile.velocity * Math.sin(Math.RAD * this.aimingAngle);
    this.scene.addObject(projectile);
    this.waitForShot = this.coolDown;
    return true;
}

Engine.assets.objects.characters.SillyCanon.prototype.updateAI = function()
{
    if (Math.abs(this.time - this.timeAIUpdated) > 2) {
        if (!this.target) {
            var o;
            for (var i in this.scene.objects) {
                o = this.scene.objects[i];
                if (o instanceof Engine.assets.objects.characters.Megaman) {
                    this.target = o;
                    break;
                }
            }
        }

        var distanceRatio = Engine.Math.findRatio(this.target.model.position.x,
            this.model.position.x - this.far,
            this.model.position.x - this.near);

        distanceRatio = Engine.Math.cap(distanceRatio, 0, 1);

        this.aimingAngle = Engine.Math.applyRatio(distanceRatio, this.aimFar, this.aimNear);

        this.timeAIUpdated = this.time;
    }
}

Engine.assets.objects.characters.SillyCanon.prototype.timeShift = function(dt)
{
    this.waitForShot -= dt;

    if (this.waitForShot <= 0) {
        this.fire();
    }

    this.updateAI(dt);
    //this.updateSprite();
    this.sprites.timeShift(dt);
    Engine.assets.objects.Character.prototype.timeShift.call(this, dt);
}
