Game.traits.Weapon = function()
{
    Engine.Trait.call(this);

    this._firing = false;

    // Duration host left in shooting state after fire.
    this._timeout = .25;
    this._duration = Infinity;
    this.projectileEmitOffset = new THREE.Vector2();
    this.projectileEmitRadius = 0;
}

Engine.Util.extend(Game.traits.Weapon, Engine.Trait);

Game.traits.Weapon.prototype.NAME = 'weapon';

Game.traits.Weapon.prototype.EVENT_FIRE = 'weapon-fire';
Game.traits.Weapon.prototype.EVENT_EQUIP = 'weapon-equip';

Game.traits.Weapon.prototype.__timeshift = function(deltaTime)
{
    if (this._firing) {
        this._duration += deltaTime;
        if (this._duration >= this._timeout) {
            this._duration = Infinity;
            this._firing = false;
        }
    }

    if (this.weapon !== undefined) {
        this.weapon.timeShift(deltaTime);
    }
}

Game.traits.Weapon.prototype.equip = function(weapon)
{
    if (weapon instanceof Game.objects.Weapon === false) {
        throw new Error('Invalid weapon');
    }
    this.weapon = weapon;
    this.weapon.setUser(this._host);
    this._host.trigger(this.EVENT_EQUIP, [weapon]);
}

Game.traits.Weapon.prototype.fire = function()
{
    if (this._host.stun && this._host.stun._engaged === true) {
        return false;
    }

    if (this.weapon === undefined) {
        return false;
    }

    if (!this.weapon.fire()) {
        return false;
    }

    this._firing = true;
    this._duration = 0;

    this._host.trigger(this.EVENT_FIRE);
    return true;
}

