Engine.traits.Stun = function()
{
    Engine.Trait.call(this);

    this._health = undefined;
    this._move = undefined;

    this._bump = new THREE.Vector2();
    this._elapsed = 0;
    this._engaged = false;
    this.duration = .5;
    this.force = 100;

    this.engage = this.engage.bind(this);
    this.disengage = this.disengage.bind(this);
}

Engine.Util.extend(Engine.traits.Stun, Engine.Trait);

Engine.traits.Stun.prototype.NAME = 'stun';

Engine.traits.Stun.prototype.EVENT_STUN_ENGAGE = 'stun-engaged';
Engine.traits.Stun.prototype.EVENT_STUN_DISENGAGE = 'stun-disengage';

Engine.traits.Stun.prototype.__attach = function(host)
{
    this._physics = this.__require(host, Engine.traits.Physics);
    this._move = this.__require(host, Engine.traits.Move);
    Engine.Trait.prototype.__attach.call(this, host);
    this._host.bind(this._host.EVENT_DAMAGE, this.engage);
}

Engine.traits.Stun.prototype.__detach = function()
{
    this._host.unbind(this._host.EVENT_DAMAGE, this.engage);
    this._health = undefined;
    this._move = undefined;
    Engine.Trait.prototype.__detach.call(this, this._host);
}

Engine.traits.Stun.prototype.__timeshift = function(deltaTime)
{
    if (this._engaged) {
        if (this._elapsed >= this.duration) {
            this.disengage();
        }
        else {
            if (this._host.isSupported) {
                this.bump();
            }
            this._elapsed += deltaTime;
        }
    }
}

Engine.traits.Stun.prototype.bump = function()
{
    this._host.physics.zero();
    this._host.physics.force.add(this._bump);
}

Engine.traits.Stun.prototype.disengage = function()
{
    if (this._engaged) {
        this._move.on();
        this._engaged = false;
    }
}

Engine.traits.Stun.prototype.engage = function(points, direction)
{
    if (this.duration !== 0 && this._engaged === false) {
        var host = this._host,
            bump = this._bump;

        bump.x = direction ? -direction.x : -host.direction.x;
        bump.y = Math.abs(bump.x * 2);
        bump.setLength(this.force);
        this.bump();

        this._move.off();
        this._engaged = true;
        this._elapsed = 0;
    }
}
