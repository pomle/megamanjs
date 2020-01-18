const {Entity} = require('@snakesilk/engine');

class Metalman extends Entity {
    routeAnimation() {
        if (!this.jump._ready) {
            if (this.weapon._firing) {
                return 'jump-fire';
            }
            return 'jump';
        }

        if (this.move._interimSpeed) {
            if (this.weapon._firing) {
                return 'fire';
            }
            return 'run';
        }

        if (this.weapon._firing) {
            return 'fire';
        }

        return 'idle';
    }
}

module.exports = Metalman;
