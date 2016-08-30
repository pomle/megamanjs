Engine.traits.Move =
class Move extends Engine.Trait
{
    constructor()
    {
        super();

        this.NAME = 'move';

        this._interimSpeed = 0;

        this.acceleration = 500;
        this.speed = 90;
    }
    __obstruct(object, attack)
    {
        if (attack === object.SURFACE_LEFT && this._host.aim.x > 0
        || attack === object.SURFACE_RIGHT && this._host.aim.x < 0) {
            this._interimSpeed = Math.abs(object.velocity.x);
        }
    }
    __timeshift(deltaTime)
    {
        if (!this._enabled) {
            return;
        }
        this._handleWalk(deltaTime);
    }
    _handleWalk(dt)
    {
        const host = this._host;
        if (host.aim.x !== 0) {
            this._interimSpeed = Math.min(this._interimSpeed + this.acceleration * dt, this.speed);
            host.velocity.x += this._interimSpeed * host.aim.x;
        }
        else {
            this._interimSpeed = 0;
        }
    }
}
