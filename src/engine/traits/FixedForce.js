Engine.traits.FixedForce = class FixedForce extends Engine.Trait
{
    constructor()
    {
        super();
        this.NAME = 'fixedForce';
        this.force = new THREE.Vector2;
    }
    __timeshift(dt)
    {
        const v = this._host.velocity;
        const f = this.force;
        v.x += f.x * dt;
        v.y += f.y * dt;
    }
}
