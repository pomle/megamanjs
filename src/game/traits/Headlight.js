Game.traits.Headlight = function()
{
    Engine.Trait.call(this);

    this.light = new THREE.PointLight(0xffffff, 1, 100);
    this.light.position.z = 20;
    this.light.intensity = 0;

    this.lampCoolDownTime = 3;
    this.lampHeatUpTime = 1;
    this.lampIntensity = 2;
    this.lampState = false;

    this.nextUpdate = 0;
    this.updateFrequency = 1.5;

    this.lightTween = undefined;
}

Engine.Util.extend(Game.traits.Headlight, Engine.Trait);

Game.traits.Headlight.prototype.NAME = 'headlight';

Game.traits.Headlight.prototype.__attach = function(host)
{
    Engine.Trait.prototype.__attach.apply(this, arguments);
    this._host.model.add(this.light);
}

Game.traits.Headlight.prototype.__detach = function()
{
    this._host.model.remove(this.light);
    Engine.Trait.prototype.__detach.apply(this, arguments);
}

Game.traits.Headlight.prototype.__timeshift = function headlightTimeshift(deltaTime)
{
    if (this.nextUpdate > this.updateFrequency) {
        this.nextUpdate = 0;
        if (this._host.world === undefined) {
            return;
        }
        var ambientLight = this._host.world.ambientLight;
        if (ambientLight.color.r < .8 || ambientLight.color.g < .8 || ambientLight.color.b < .8) {
            this.on();
        }
        else {
            this.off();
        }
    }
    this.nextUpdate += deltaTime;

    this._updateLight(deltaTime);
}

Game.traits.Headlight.prototype._updateLight = function(deltaTime)
{
    if (this.lightTween !== undefined) {
        var t = this.lightTween;
        t.updateTime(deltaTime);
        if (t.progress >= t.duration) {
            this.lightTween = undefined;
        }
    }
}

Game.traits.Headlight.prototype._updateScene = function()
{
    this._host.world.scene.children.forEach(function(mesh) {
        if (mesh.material) {
            mesh.material.needsUpdate = true;
        }
    });
}

Game.traits.Headlight.prototype.on = function()
{
    if (this.lampState === false) {
        this._updateScene();
        this.lightTween = new Engine.Tween(
            {intensity: this.lampIntensity},
            Engine.Easing.easeOutCubic,
            this.lampHeatUpTime);
        this.lightTween.addObject(this.light);
        this.lampState = true;
    }
}

Game.traits.Headlight.prototype.off = function()
{
    if (this.lampState === true) {
        this.lightTween = new Engine.Tween(
            {intensity: 0},
            Engine.Easing.easeOutCubic,
            this.lampCoolDownTime);
        this.lightTween.addObject(this.light);
        this.lampState = true;
    }
}

