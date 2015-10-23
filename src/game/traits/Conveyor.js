Game.traits.Conveyor = function()
{
    Game.traits.Solid.call(this);
    this.velocity = new THREE.Vector2(40, 0);
}

Engine.Util.extend(Game.traits.Conveyor, Game.traits.Solid);
Game.traits.Conveyor.prototype.NAME = 'conveyor';

Game.traits.Conveyor.prototype.__collides = function(subject)
{
    Game.traits.Solid.prototype.__collides.apply(this, arguments);
    if (subject.physics) {
        subject.physics.velocity.add(this.velocity);
    }
}

Game.traits.Conveyor.prototype.swapDirection = function()
{
    this._host.model.scale.x = -this._host.model.scale.x;
    this.velocity.x = -this.velocity.x;
}
