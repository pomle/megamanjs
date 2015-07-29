Game.objects.characters.SillyCanon = function(target)
{
    Game.objects.Character.call(this);

    var model = Engine.SpriteManager.createSprite('enemies/sillycanon.png', 32, 32);
    this.sprites = new Engine.SpriteManager(model, 32, 32, 256, 32);

    var deg0 = this.sprites.addSprite('deg0');
    deg0.addFrame(32, 0, .25);
    deg0.addFrame(0,  0, .24);
    var deg22 = this.sprites.addSprite('deg22');
    deg22.addFrame(96, 0, .25);
    deg22.addFrame(64, 0, .25);
    var deg45 = this.sprites.addSprite('deg45');
    deg45.addFrame(160, 0, .25);
    deg45.addFrame(128, 0, .25);


    this.sprites.selectSprite('deg0');
    this.sprites.applySprite();

    this.setModel(model);
    this.addCollisionRect(16, 20, 0, -5);

    this.health = new Game.objects.Energy(10);

    this.setDirection(this.LEFT);

    this.coolDown = .8;
    this.waitForShot = 0;
    this.mass = 0;
    this.target = target;

    this.timeAIUpdated = null;


    this.far = 200;
    this.near = 0;
    this.aimFar = 160;
    this.aimNear = 92;
    this.aimingAngle = this.aimFar;
    this.aimingSpeed = 50;
    this.shootingAngle = this.aimingAngle;
}

Game.objects.characters.SillyCanon.prototype = Object.create(Game.objects.Character.prototype);
Game.objects.characters.SillyCanon.constructor = Game.objects.characters.SillyCanon;

Game.objects.characters.SillyCanon.prototype.fire = function()
{
    if (this.waitForShot > 0) {
        return;
    }

    var projectile = new Game.objects.projectiles.EnemyPlasma();
    projectile.mass = 1;
    projectile.setEmitter(this);

    var kX = Math.cos(Math.RAD * this.shootingAngle);
    var kY = Math.sin(Math.RAD * this.shootingAngle);

    var originXOffset = 16 * kX;
    var originYOffset = kY;

    var origin = new THREE.Vector3(
        this.model.position.x + originXOffset,
        this.model.position.y + originYOffset,
        0);

    projectile.setOrigin(origin);

    projectile.inertia.x = projectile.speed * kX;
    projectile.inertia.y = projectile.speed * kY;
    this.scene.addObject(projectile);
    this.waitForShot = this.coolDown;
    return true;
}

Game.objects.characters.SillyCanon.prototype.updateAI = function()
{
    if (Math.abs(this.time - this.timeAIUpdated) > 2) {
        var target = this.ai.findPlayer();
        if (target) {
            var distanceRatio = Engine.Math.findRatio(target.position.x,
                target.position.x - this.far,
                target.position.x - this.near);

            distanceRatio = Engine.Math.clamp(distanceRatio, 0, 1);
            this.aimingAngle = Engine.Math.applyRatio(distanceRatio, this.aimFar, this.aimNear);
            this.timeAIUpdated = this.time;
        }
    }
}

Game.objects.characters.SillyCanon.prototype.timeShift = function(dt)
{
    this.waitForShot -= dt;

    if (this.waitForShot <= 0) {
        this.fire();
    }

    this.updateAI(dt);
    var aimingDiff = this.aimingAngle - this.shootingAngle;
    this.shootingAngle += Engine.Math.clamp(aimingDiff, -this.aimingSpeed, this.aimingSpeed) * dt;

    if (this.shootingAngle > 145) {
        this.sprites.selectSprite('deg0');
    }
    else if (this.shootingAngle > 115) {
        this.sprites.selectSprite('deg22');
    }
    else {
        this.sprites.selectSprite('deg45');
    }
    this.sprites.setDirection(this.direction);

    if (Math.abs(this.shootingAngle - this.aimingAngle) > 2) {
        this.sprites.applySprite();
        this.sprites.timeShift(dt);
    }

    Game.objects.Character.prototype.timeShift.call(this, dt);
}
