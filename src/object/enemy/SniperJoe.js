Engine.assets.objects.characters.SniperJoe = function(target)
{
    Engine.assets.objects.Character.call(this);

    var model = Engine.Util.createSprite('enemies/sniperjoe.png', 32, 32);
    this.sprites = new Engine.SpriteManager(model, 32, 32, 64, 32);

    var shielding = this.sprites.addSprite('shielding');
    shielding.addFrame(0, 0);
    var shooting = this.sprites.addSprite('shooting');
    shooting.addFrame(0, 0);

    this.sprites.selectSprite('shielding');
    this.sprites.applySprite();

    this.setModel(model);
    this.addCollisionRect(20, 24);

    this.health = new Engine.assets.Energy(10);

    this.setDirection(this.LEFT);

    this.walkSpeed = 0;

    this.jumpForce = new THREE.Vector2(130, 300);

    this.passenger = new Engine.assets.objects.characters.SniperJoe();


    this.target = undefined;
    this.isJumpCharged = false;
    this.jumpCoolDown = 0;
    this.isJumpCharged = 0;
    this.jumpProgression = null;
    this.timeLastJump = null;
    this.timeAIUpdated = null;
}

Engine.assets.objects.characters.SniperJoe.prototype = Object.create(Engine.assets.objects.Character.prototype);
Engine.assets.objects.characters.SniperJoe.constructor = Engine.assets.objects.characters.SniperJoe;

Engine.assets.objects.characters.SniperJoe.prototype.jumpStart = function(dt)
{
    if (this.jumpCoolDown > 0) {
        return false;
    }
    this.jumpCoolDown = 4;
    this.jumpCharging = .5;
    this.isJumpCharged = false;
}

Engine.assets.objects.characters.SniperJoe.prototype.jumpEnd = function(dt)
{
    this.isJumpCharged = false;
}

Engine.assets.objects.characters.SniperJoe.prototype.selectSprite = function(dt)
{
    this.sprites.setDirection(this.direction);
    if (!this.isSupported) {
        return this.sprites.selectSprite('jumping');
    }
    if (this.jumpCharging) {
        return this.sprites.selectSprite('charging');
    }
    return this.sprites.selectSprite('idle');
}

Engine.assets.objects.characters.SniperJoe.prototype.updateAI = function()
{
    if (Math.abs(this.time - this.timeAIUpdated) < 2) {
        return;
    }
    this.timeAIUpdated = this.time;

    if (!this.target) {
        var o;
        for (var i in this.scene.objects) {
            o = this.scene.objects[i];
            if (o.isPlayer) {
                this.target = o;
                break;
            }
        }
    }

    if (this.target.position.distanceTo(this.position) > 300) {
        return;
    }

    this.setDirection(this.target.position.x > this.position.x ? this.RIGHT : this.LEFT);
    this.jumpStart();
}

Engine.assets.objects.characters.SniperJoe.prototype.timeShift = function(dt)
{
    this.updateAI(dt);

    if (this.jumpCharging) {
        this.jumpCharging -= dt;
        if (this.jumpCharging <= 0) {
            this.jumpCharging = false;
            this.isJumpCharged = 1;
        }
    }

    if (this.isJumpCharged) {
        this.inertia.set(this.jumpForce.x * this.direction,
                          this.jumpForce.y);
        this.jumpCoolDown = 2.5;
        console.log(this.inertia);
        this.jumpEnd();
    }

    if (this.jumpCoolDown > 0) {
        this.jumpCoolDown -= dt;
        if (this.jumpCoolDown <= 0) {
            this.jumpCoolDown = 0;
        }
    }

    this.selectSprite();
    this.sprites.applySprite();
    Engine.assets.objects.Character.prototype.timeShift.call(this, dt);
}
