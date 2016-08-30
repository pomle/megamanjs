Engine.objects.characters.Shotman = function(target)
{
    Engine.Object.call(this);
    this.ai = new Engine.AI(this);

    this.coolDown = .8;
    this.waitForShot = 0;
    this.target = target;

    this.timeAIUpdated = null;

    this.RAD = Math.PI/180;

    this.far = 200;
    this.near = 0;
    this.aimFar = 160;
    this.aimNear = 92;
    this.aimingAngle = this.aimFar;
    this.aimingSpeed = 50;
    this.shootingAngle = this.aimingAngle;
}

Engine.Util.extend(Engine.objects.characters.Shotman,
                   Engine.Object);

Engine.objects.characters.Shotman.prototype.fire = function()
{
    if (this.waitForShot > 0) {
        return;
    }

    var projectile = new Engine.objects.projectiles.EnemyPlasma();
    projectile.physics.enabled = true;

    var kX = Math.cos(this.RAD * this.shootingAngle);
    var kY = Math.sin(this.RAD * this.shootingAngle);

    projectile.setEmitter(this, new THREE.Vector2(kX, kY));

    var originXOffset = 16 * kX;
    var originYOffset = kY;

    var origin = new THREE.Vector3(
        this.model.position.x + originXOffset,
        this.model.position.y + originYOffset,
        0);

    projectile.setOrigin(origin);

    projectile.inertia.x = projectile.speed * kX;
    projectile.inertia.y = projectile.speed * kY;
    this.world.addObject(projectile);
    this.waitForShot = this.coolDown;
    return true;
}

Engine.objects.characters.Shotman.prototype.updateAI = function()
{
    if (Math.abs(this.time - this.timeAIUpdated) > 2) {
        var target = this.ai.findPlayer();
        if (target) {
            var distanceRatio = Engine.Math.findRatio(target.position.x,
                target.position.x - this.far,
                target.position.x - this.near);

            distanceRatio = Engine.Math.clamp(distanceRatio, 0, 1);
            this.aimingAngle = Engine.Math.applyRatio(distanceRatio, this.aimFar, this.aimNear);
            this.timeAIUpdated = this.time;
        }
    }
}

Engine.objects.characters.Shotman.prototype.routeAnimation = function()
{
    if (this.shootingAngle > 145) {
        return 'deg0';
    }
    else if (this.shootingAngle > 115) {
        return 'deg22';
    }
    else {
        return 'deg45';
    }
}

Engine.objects.characters.Shotman.prototype.timeShift = function(dt)
{
    this.waitForShot -= dt;

    if (this.waitForShot <= 0) {
        this.weapon.fire();
        this.waitForShot = this.coolDown;
    }

    this.updateAI(dt);
    var aimingDiff = this.aimingAngle - this.shootingAngle;
    this.shootingAngle += Engine.Math.clamp(aimingDiff, -this.aimingSpeed, this.aimingSpeed) * dt;
    var kX = Math.cos(this.RAD * this.shootingAngle);
    var kY = Math.sin(this.RAD * this.shootingAngle);
    this.aim.set(kX, kY);

    this.animators[0].enabled = Math.abs(this.shootingAngle - this.aimingAngle) > 2;

    Engine.Object.prototype.timeShift.call(this, dt);
}
