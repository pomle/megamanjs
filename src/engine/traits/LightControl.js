const {Color} = require('three');
const Trait = require('../Trait');
const Tween = require('../Tween');

class LightControl extends Trait
{
    constructor()
    {
        super();
        this.NAME = 'lightcontrol';

        this.color = new Color(1,1,1);
        this.duration = 1;

        this._ignore = new Set();
        this._progress = null;
        this._tween = null;
    }
    __collides(withObject)
    {
        const color = this._host.world.ambientLight.color;
        if (this._progress === null &&
            withObject.isPlayer === true &&
            this.color.equals(color) === false &&
            this._ignore.has(withObject) === false)
        {
            this._tween = new Tween({
                r: this.color.r,
                g: this.color.g,
                b: this.color.b,
            });
            this._tween.addSubject(color);
            this._progress = 0;
            this._ignore.add(withObject);
        }
    }
    __uncollides(withObject)
    {
        this._ignore.delete(withObject);
    }
    __timeshift(deltaTime)
    {
        if (this._progress === null) {
            return;
        }
        this._progress += deltaTime;
        let frac = this._progress / this.duration;
        if (frac > 1) {
            frac = 1;
            this._progress = null;
        }
        this._tween.update(frac);
    }
}

module.exports = LightControl;
