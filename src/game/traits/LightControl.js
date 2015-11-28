Game.traits.LightControl = function()
{
    Engine.Trait.call(this);

    this.color = new THREE.Color(1,1,1);

    this.tween = undefined;
    this.progress = undefined;
    this.duration = 1;
    this.ignore = new Set();
}

Engine.Util.extend(Game.traits.LightControl, Engine.Trait);

Game.traits.LightControl.prototype.NAME = 'lightcontrol';

Game.traits.LightControl.prototype.__collides = function(withObject)
{
    var c = this._host.world.ambientLight.color;
    if (this.progress === undefined
    && withObject.isPlayer === true
    && this.color.equals(c) === false
    && this.ignore.has(withObject) === false) {
        this.tween = new Engine.Tween({
            r: this.color.r,
            g: this.color.g,
            b: this.color.b,
        });
        this.tween.addObject(this._host.world.ambientLight.color);
        this.progress = 0;
        this.ignore.add(withObject);
    }
}

Game.traits.LightControl.prototype.__uncollides = function(withObject)
{
    console.log('Removing %s from ignore list', withObject);
    this.ignore.delete(withObject);
}

Game.traits.LightControl.prototype.__timeshift = function(deltaTime)
{
    if (this.progress === undefined) {
        return;
    }
    this.progress += deltaTime;
    var frac = this.progress / this.duration;
    if (frac > 1) {
        frac = 1;
        this.progress = undefined;
    }
    this.tween.updateValue(frac);
}
