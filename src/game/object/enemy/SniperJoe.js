Game.objects.characters.SniperJoe = function(target)
{
    Game.objects.Character.call(this);

    this.coolDown = .8;
    this.isShielding = true;

    this._coolDownCounter = 0;
    this._firingLoop = -1;
}

Engine.Util.extend(Game.objects.characters.SniperJoe,
                   Game.objects.Character);

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

Game.objects.characters.SniperJoe.prototype.routeAnimation = function(dt)
{
    if (this.isShielding) {
        return 'shielding';
    }
    return 'shooting';
}

Game.objects.characters.SniperJoe.prototype.updateAI = function()
{
    if (Math.abs(this.time - this.timeAIUpdated) < 2) {
        return;
    }
    this.timeAIUpdated = this.time;

    if (this.ai.findPlayer()) {
        if (this.ai.target.position.distanceTo(this.position) > 200) {
            this._firingLoop = -1;
            return;
        }

        this.ai.faceTarget();
        if (this._firingLoop < 0) {
            this._firingLoop = 0;
        }
    }
}

Game.objects.characters.SniperJoe.prototype.timeShift = function(dt)
{
    this.updateAI(dt);

    if (this._firingLoop !== -1) {
        this._firingLoop += dt;
        var fireLoopDelta = this._firingLoop % 4;
        if (fireLoopDelta <= 2) {
            this.isShielding = true;
        }
        else {
            this.isShielding = false;
            if (fireLoopDelta > 2.5) {
                this._coolDownCounter -= dt;
                if (this._coolDownCounter <= 0 && this.weapon.fire()) {
                    this._coolDownCounter = this.coolDown;
                }
            }
        }
    }

    Game.objects.Character.prototype.timeShift.call(this, dt);
}
