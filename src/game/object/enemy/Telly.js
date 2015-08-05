Game.objects.characters.Telly = function()
{
    Game.objects.Character.call(this);

    this.physics.off();

    this.contactDamage.points = 1;
    this.health.max = 1;
    this.speed = 12;
}

Engine.Util.extend(Game.objects.characters.Telly, Game.objects.Character);

Game.objects.characters.Telly.prototype.updateAI = function()
{
    if (Math.abs(this.time - this.timeAIUpdated) < 1) {
        return;
    }

    this.timeAIUpdated = this.time;

    if (this.ai.findPlayer()) {
        if (this.ai.target.position.distanceTo(this.position) > 300) {
            return;
        }
        this.ai.faceTarget();
        this.velocity.x = 0;
        this.velocity.y = 0;
        var distX = this.position.x - this.ai.target.position.x;
        var distY = this.position.y - this.ai.target.position.y;
        this.velocity.x = distX > 0 ? -this.speed : this.speed;
        if (Math.abs(distY) > 16 || Math.random() < .25) {
            this.velocity.y = distY > 0 ? -this.speed : this.speed;
        }
    }
}

Game.objects.characters.Telly.prototype.timeShift = function(dt)
{
    this.updateAI(dt);
    this.animator.update(dt);
    Game.objects.Character.prototype.timeShift.call(this, dt);
}
