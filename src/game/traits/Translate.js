Game.traits.Translate = function()
{
    Engine.Trait.call(this);
    this.velocity = new THREE.Vector2(1, 1);
}

Engine.Util.extend(Game.traits.Translate, Engine.Trait);

Game.traits.Translate.prototype.NAME = 'translate';

Game.traits.Translate.prototype.__timeshift = function(deltaTime)
{
    var host = this._host;
    host.position.x += this.velocity.x * deltaTime;
    host.position.y += this.velocity.y * deltaTime;
}
