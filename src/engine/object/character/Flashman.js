import Entity from '../../Object';

class Flashman extends Entity
{
    constructor() {
        super();
        this.isFlashing = false;
    }

    routeAnimation()
    {
        if (this.weapon._firing) {
            return 'fire';
        }

        if (!this.jump._ready) {
            return 'jump';
        }

        if (this.move._interimSpeed) {
            return 'run';
        }

        if (this.isFlashing) {
            return 'flash';
        }

        return 'idle';
    }
}

export default Flashman;
