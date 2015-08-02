Game.objects.characters.SniperArmor = function()
{
    Game.objects.Character.call(this);

    var model = Engine.SpriteManager.createSprite('enemies/sniperarmor.png', 64, 64);
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
    this.addCollisionRect(24, 56, -4, -4);
    this.addCollisionRect(28, 28, 0, 10);

    this.contactDamage = 8;
    this.health.max = 20;

    this.walkSpeed = 0;

    this.jumpForce = new THREE.Vector2(130, 300);

    this.passenger = new Game.objects.characters.SniperJoe();


    this.target = undefined;
    this.airTime = 0;
    this.groundTime = 0;
    this.jumpCoolDown = 0;
    this.isJumpCharged = 0;
    this.jumpProgression = null;
    this.timeAIUpdated = null;
}

Game.objects.characters.SniperArmor.prototype = Object.create(Game.objects.Character.prototype);
Game.objects.characters.SniperArmor.constructor = Game.objects.characters.SniperArmor;


Game.objects.characters.SniperArmor.prototype.getDeathObject = function()
{
    return this.passenger;
}

Game.objects.characters.SniperArmor.prototype.jumpStart = function(dt)
{
    if (this.jumpCoolDown > 0) {
        return false;
    }
    this.jumpCoolDown = 4;
    this.jumpCharging = .5;
    this.isJumpCharged = false;
}

Game.objects.characters.SniperArmor.prototype.jumpEnd = function(dt)
{
    this.isJumpCharged = false;
}

Game.objects.characters.SniperArmor.prototype.selectSprite = function(dt)
{
    this.sprites.setDirection(this.direction.x);
    if (!this.isSupported) {
        return this.sprites.selectSprite('jumping');
    }
    if (this.jumpCharging || this.groundTime < .1) {
        return this.sprites.selectSprite('charging');
    }
    return this.sprites.selectSprite('idle');
}

Game.objects.characters.SniperArmor.prototype.updateAI = function()
{
    if (Math.abs(this.time - this.timeAIUpdated) < 2) {
        return;
    }

    this.timeAIUpdated = this.time;

    if (this.ai.findPlayer()) {
        if (this.ai.target.position.distanceTo(this.position) > 300) {
            return;
        }
        this.faceTarger();
        this.jumpStart();
    }
}

Game.objects.characters.SniperArmor.prototype.timeShift = function(dt)
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
        this.physics.bump(this.jumpForce.x * this.direction.x,
                          this.jumpForce.y);
        this.jumpCoolDown = 2.5;
        this.jumpEnd();
    }

    if (this.jumpCoolDown > 0) {
        this.jumpCoolDown -= dt;
        if (this.jumpCoolDown <= 0) {
            this.jumpCoolDown = 0;
        }
    }

    if (this.isSupported) {
        this.groundTime += dt;
        this.airTime = 0;
    }
    else {
        this.airTime += dt;
        this.groundTime = 0;
    }

    this.selectSprite();
    this.sprites.applySprite();
    Game.objects.Character.prototype.timeShift.call(this, dt);
}
