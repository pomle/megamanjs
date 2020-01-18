const {Entity} = require('@snakesilk/engine');

class Crashman extends Entity
{
    routeAnimation()
    {
        if (!this.jump._ready) {
            if (this.weapon._firing) {
                return 'jump-fire';
            }
            return 'jump';
        }

        if (this.move._interimSpeed) {
            return 'run';
        }

        return 'idle';
    }
}

module.exports = Crashman;
