Engine.objects.characters.ChangkeyMaker = function()
{
    Engine.Object.call(this);
    this.ai = new Engine.AI(this);

    this.fire = false;
    this.fireCoolDown = 2;
    this.fireLoop = 0;
    this.fireWait = 0;
    this.flickerLoop = 0;
    this.flickerIntensity = .25;
    this.flickerDelay = .05;

    var light = new THREE.PointLight(0xff5400, 2, 256);
    light.position.z = 20;

    var glow = new Engine.traits.Glow();
    glow.addLamp(light);

    this.applyTrait(glow);
}

Engine.Util.extend(Engine.objects.characters.ChangkeyMaker,
                   Engine.Object);

Engine.objects.characters.ChangkeyMaker.prototype.routeAnimation = function()
{
    if (this.fireWait < 1) {
        return 'throw';
    }
    return 'idle';
}

Engine.objects.characters.ChangkeyMaker.prototype.updateAI = function(dt)
{
    if (this.ai.findPlayer() && this.ai.target.position.distanceTo(this.position) < 300) {
        if (this.fireLoop === undefined) {
            this.fireLoop = 0;
        }
    }
    else {
        this.fireLoop = undefined;
    }
}

Engine.objects.characters.ChangkeyMaker.prototype.timeShift = function(dt)
{
    this.updateAI(dt);

    if (this.fireLoop !== undefined) {
        this.fireLoop += dt;
        this.fireWait -= dt;
        if (this.fireWait <= 0) {
            //this.fire();
            this.fireWait = this.fireCoolDown;
        }
    }
    else {
        this.fireWait = Infinity;
    }

    Engine.Object.prototype.timeShift.call(this, dt);

    this.flickerLoop += dt;
    if (this.flickerLoop > this.flickerDelay) {
        this.flickerLoop = 0;
        var lamps = this.glow.lamps;
        for (var i = 0, l = lamps.length; i !== l; ++i) {
            lamps[i].light.intensity = lamps[i].intensity + (this.flickerIntensity * Math.random());
        }
        this.flickerIntensity = -this.flickerIntensity;
    }
}
