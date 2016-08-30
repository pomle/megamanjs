Engine.traits.Stun =
class Stun extends Engine.Trait
{
    constructor()
    {
        super();

        this.NAME = 'stun';
        this.EVENT_STUN_ENGAGE = 'stun-engaged';
        this.EVENT_STUN_DISENGAGE = 'stun-disengage';

        this._bumpForce = new THREE.Vector2();
        this._elapsed = 0;
        this._engaged = false;

        this.duration = .5;
        this.force = 100;

        this.engage = this.engage.bind(this);
        this.disengage = this.disengage.bind(this);

        this.__requires(Engine.traits.Health);
        this.__requires(Engine.traits.Physics);
    }
    __attach(host)
    {
        const health = this.__require(host, Engine.traits.Health);
        super.__attach(host);
        this._bind(health.EVENT_HURT, this.engage);
    }
    __detach()
    {
        const health = this.__require(host, Engine.traits.Health);
        this._host.unbind(health.EVENT_HURT, this.engage);
        super.__detach(this._host);
    }
    __obstruct(object, attack)
    {
        if (this._engaged === true && attack === object.SURFACE_TOP) {
            this._bumpForce.multiplyScalar(.8);
            this._bump();
        }
    }
    __timeshift(deltaTime)
    {
        if (this._engaged) {
            if (this._elapsed >= this.duration) {
                this.disengage();
            }
            else {
                this._elapsed += deltaTime;
            }
        }
    }
    _bump()
    {
        this._host.physics.zero();
        this._host.physics.force.copy(this._bumpForce);
    }
    disengage()
    {
        if (this._engaged) {
            const move = this._host.move;
            const jump = this._host.jump;
            if (move) {
                move.enable();
            }
            if (jump) {
                jump.enable();
                jump.reset();
            }
            this._engaged = false;
        }
    }
    engage(points, direction)
    {
        if (this.duration !== 0 && this._engaged === false) {
            const host = this._host;
            const bump = this._bumpForce;

            bump.x = direction ? -direction.x : -host.direction.x;
            bump.y = Math.abs(bump.x * 2);
            bump.setLength(this.force);
            this._bump();

            const move = this._host.move;
            const jump = this._host.jump;
            if (move) {
                move.disable();
            }
            if (jump) {
                jump.disable();
            }
            this._engaged = true;
            this._elapsed = 0;
        }
    }
    reset()
    {
        this.disengage();
    }
}
