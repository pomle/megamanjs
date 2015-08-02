Game.objects.characters.SniperJoe = function(target)
{
    Game.objects.Character.call(this);

    var model = Engine.SpriteManager.createSprite('enemies/sniperjoe.png', 32, 32);
    this.sprites = new Engine.SpriteManager(model, 32, 32, 64, 32);

    var shielding = this.sprites.addSprite('shielding');
    shielding.addFrame(0, 0);
    var shooting = this.sprites.addSprite('shooting');
    shooting.addFrame(32, 0);

    this.sprites.selectSprite('shielding');
    this.sprites.applySprite();

    this.setModel(model);
    this.addCollisionRect(20, 24);

    this.contactDamage.points = 4;
    this.health.max = 10;

    var weapon = new Game.objects.weapons.EnemyPlasma();
    weapon.setCoolDown(.8);
    this.weapon.equip(weapon);
    this.weapon.projectileEmitOffset.set(9, -2);

    this.firingLoop = -1;
    this.target = undefined;
    this.isShielding = true;
}

Game.objects.characters.SniperJoe.prototype = Object.create(Game.objects.Character.prototype);
Game.objects.characters.SniperJoe.constructor = Game.objects.characters.SniperJoe;

Game.objects.characters.SniperJoe.prototype.impactProjectile = function(projectile)
{
    // Is the shield pointing towards the projectile
    if (this.isShielding) {
        var relativeXSpeed = this.velocity.x - projectile.velocity.x;
        var impactDirection = relativeXSpeed < 0 ? this.DIRECTION_LEFT : this.DIRECTION_RIGHT;
        if (impactDirection == this.direction.x) {
            projectile.deflect();
            return false;
        }
    }

    return Game.objects.Character.prototype.impactProjectile.call(this, projectile);
}

Game.objects.characters.SniperJoe.prototype.selectSprite = function(dt)
{
    this.sprites.setDirection(this.direction.x);
    if (this.isShielding) {
        return this.sprites.selectSprite('shielding');
    }
    return this.sprites.selectSprite('shooting');
}

Game.objects.characters.SniperJoe.prototype.updateAI = function()
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

Game.objects.characters.SniperJoe.prototype.timeShift = function(dt)
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
                this.weapon.fire();
            }
        }
    }

    this.selectSprite();
    this.sprites.applySprite();
    Game.objects.Character.prototype.timeShift.call(this, dt);
}
