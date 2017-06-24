const Trait = require('../Trait');

class DeathZone extends Trait
{
    constructor()
    {
        super();
        this.NAME = 'deathZone';
    }
    __collides(withObject, ourZone, theirZone)
    {
        if (withObject.health && withObject.health.energy.depleted === false) {
            withObject.health.kill();
        }
    }
}

module.exports = DeathZone;
