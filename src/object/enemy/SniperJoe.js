Engine.assets.objects.characters.SniperJoe = function(target)
{
    Engine.assets.objects.Character.call(this);

    var model = Engine.Util.createSprite('enemies/sniperjoe.png', 32, 32);
    this.sprites = new Engine.SpriteManager(model, 32, 32, 64, 32);

    var shielding = this.sprites.addSprite('shielding');
    shielding.addFrame(0, 0);
    var shooting = this.sprites.addSprite('shooting');
    shooting.addFrame(32, 0);

    this.sprites.selectSprite('shielding');
    this.sprites.applySprite();

    this.setModel(model);
    this.addCollisionRect(20, 24);

    this.contactDamage = 4;
    this.health = new Engine.assets.Energy(10);

    this.setDirection(this.LEFT);

    var weapon = new Engine.assets.weapons.EnemyPlasma();
    weapon.setCoolDown(.8);
    this.equipWeapon(weapon);

    this.projectileEmitOffset.set(9, -2);

    this.firingLoop = -1;
    this.target = undefined;
    this.isShielding = true;
}

Engine.assets.objects.characters.SniperJoe.prototype = Object.create(Engine.assets.objects.Character.prototype);
Engine.assets.objects.characters.SniperJoe.constructor = Engine.assets.objects.characters.SniperJoe;

Engine.assets.objects.characters.SniperJoe.prototype.impactProjectile = function(projectile)
{
    // Is the shield pointing towards the projectile
    if (this.isShielding) {
        var relativeXSpeed = this.velocity.x - projectile.velocity.x;
        var impactDirection = relativeXSpeed < 0 ? this.LEFT : this.RIGHT;
        if (impactDirection == this.direction) {
            projectile.deflect();
            return false;
        }
    }

    return Engine.assets.objects.Character.prototype.impactProjectile.call(this, projectile);
}

Engine.assets.objects.characters.SniperJoe.prototype.selectSprite = function(dt)
{
    this.sprites.setDirection(this.direction);
    if (this.isShielding) {
        return this.sprites.selectSprite('shielding');
    }
    return this.sprites.selectSprite('shooting');
}

Engine.assets.objects.characters.SniperJoe.prototype.updateAI = function()
{
    if (Math.abs(this.time - this.timeAIUpdated) < 2) {
        return;
    }
    this.timeAIUpdated = this.time;

    if (this.ai.findPlayer()) {
        if (this.ai.target.position.distanceTo(this.position) > 200) {
            this.firingLoop = -1;
            return;
        }

        this.ai.faceTarget();
        if (this.firingLoop < 0) {
            this.firingLoop = 0;
        }
    }
}

Engine.assets.objects.characters.SniperJoe.prototype.timeShift = function(dt)
{
    this.updateAI(dt);

    if (this.firingLoop >= 0) {
        this.firingLoop += dt;
        var fireLoopDelta = this.firingLoop % 4;
        if (fireLoopDelta <= 2) {
            this.isShielding = true;
        }
        else {
            this.isShielding = false;
            if (fireLoopDelta > 2.5) {
                this.fire();
            }
        }
    }

    this.selectSprite();
    this.sprites.applySprite();
    Engine.assets.objects.Character.prototype.timeShift.call(this, dt);
}
