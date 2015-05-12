Engine.assets.objects.characters.SniperArmor = function(target)
{
    Engine.assets.objects.Character.call(this);

    var model = Engine.Util.createSprite('enemies/sniperarmor.png', 64, 64);
    this.sprites = new Engine.SpriteManager(model, 64, 64, 256, 64);

    var idle = this.sprites.addSprite('idle');
    idle.addFrame(0, 0);
    var charging = this.sprites.addSprite('charging');
    charging.addFrame(64, 0);
    var jumping = this.sprites.addSprite('jumping');
    jumping.addFrame(128, 0);

    this.sprites.selectSprite('idle');
    this.sprites.applySprite();

    this.setModel(model);
    this.addCollisionRect(36, 56, 0, -4);

    this.health = new Engine.assets.Energy(20);

    this.setDirection(this.LEFT);

    this.walkSpeed = 0;

    this.jumpForce = new THREE.Vector2(130, 300);

    this.target = undefined;
    this.isJumpCharged = false;
    this.jumpCoolDown = 0;
    this.isJumpCharged = 0;
    this.jumpProgression = null;
    this.timeLastJump = null;
    this.timeAIUpdated = null;
}

Engine.assets.objects.characters.SniperArmor.prototype = Object.create(Engine.assets.objects.Character.prototype);
Engine.assets.objects.characters.SniperArmor.constructor = Engine.assets.objects.characters.SniperArmor;

Engine.assets.objects.characters.SniperArmor.prototype.jumpStart = function(dt)
{
    if (this.jumpCoolDown > 0) {
        return false;
    }
    this.jumpCoolDown = 4;
    this.jumpCharging = .5;
    this.isJumpCharged = false;
}

Engine.assets.objects.characters.SniperArmor.prototype.jumpEnd = function(dt)
{
    this.isJumpCharged = false;
}

Engine.assets.objects.characters.SniperArmor.prototype.selectSprite = function(dt)
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

Engine.assets.objects.characters.SniperArmor.prototype.updateAI = function()
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

Engine.assets.objects.characters.SniperArmor.prototype.timeShift = function(dt)
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
