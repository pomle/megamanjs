Game.objects.characters.Batton = function(target)
{
    Game.objects.Character.call(this);

    this.attackTime = undefined;
    this.idleTime = 0;
    this.destination = new THREE.Vector2();
    this.isShielding = true;
    this.timeSequence = undefined;
    this.speed = 60;

    this.waitForAttack = undefined;

    this.timeAIUpdated = 0;
}

Engine.Util.extend(Game.objects.characters.Batton,
                   Game.objects.Character);

Game.objects.characters.Batton.prototype.impactProjectile = function(projectile)
{
    if (this.isShielding) {
        projectile.deflect();
        return false;
    }

    return Game.objects.Character.prototype.impactProjectile.call(this, projectile);
}

Game.objects.characters.Batton.prototype.routeAnimation = function(dt)
{
    if (this.isShielding === true) {
        return 'closed';
    }
    if (this.attackTime < .5) {
        return 'opening';
    }
    return 'flapping';
}

Game.objects.characters.Batton.prototype.updateAI = function()
{
    if (Math.abs(this.time - this.timeAIUpdated) < 1) {
        return;
    }
    this.timeAIUpdated = this.time;

    if (this.idleTime < 2) {
        return;
    }
    if (!this.ai.findPlayer()) {
        return;
    }
    if (this.ai.target.position.distanceTo(this.position) > 200) {
        return;
    }
    if (this.attackTime === undefined) {
        this.attackTime = 0;
        this.isShielding = false;
    }
    this.destination.copy(this.ai.target.position);
}

Game.objects.characters.Batton.prototype.timeShift = function(dt)
{
    this.updateAI(dt);

    if (this.attackTime !== undefined) {
        this.attackTime += dt;
    }

    this.velocity.copy(this.destination).sub(this.position);
    this.velocity.setLength(this.speed);

    this.idleTime += dt;
    Game.objects.Character.prototype.timeShift.call(this, dt);
}
