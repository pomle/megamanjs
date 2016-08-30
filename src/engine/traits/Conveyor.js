Engine.traits.Conveyor =
class Conveyor extends Engine.traits.Solid
{
    constructor()
    {
        super();
        this.NAME = 'conveyor';
        this.velocity = new THREE.Vector2(40, 0);
        this.fixed = true;
        this.obstructs = true;
    }
    __collides(subject)
    {
        const attack = super.__collides.apply(this, arguments);
        if (attack === this.TOP) {
            subject.velocity.copy(this.velocity);
        }
    }
    swapDirection()
    {
        const dir = this._host.direction;
        const vel = this.velocity;
        dir.x = -dir.x;
        vel.x = -vel.x;
    }
}
