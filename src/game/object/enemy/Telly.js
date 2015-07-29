Game.objects.characters.Telly = function()
{
    Game.objects.Character.call(this);

    var model = Engine.SpriteManager.createSprite('enemies/telly.png', 16, 16);
    this.sprites = new Engine.SpriteManager(model, 16, 16, 128, 16);

    var spin = this.sprites.addSprite('spin');
    var frameLen = .16;
    spin.addFrame(80, 0, frameLen);
    spin.addFrame(64, 0, frameLen);
    spin.addFrame(48, 0, frameLen);
    spin.addFrame(32, 0, frameLen);
    spin.addFrame(16, 0, frameLen);
    spin.addFrame(0, 0, frameLen);

    this.sprites.selectSprite('spin');
    this.sprites.applySprite();

    this.setModel(model);
    this.addCollisionRect(16, 16, 0, 0);

    this.contactDamage = 1;
    this.obstructible = false;
    this.mass = 0;
    this.health = new Game.objects.Energy(1);
    this.setDirection(this.LEFT);
    this.speed = 12;

    this.physics.enabled = false;
}

Game.objects.characters.Telly.prototype = Object.create(Game.objects.Character.prototype);
Game.objects.characters.Telly.constructor = Game.objects.characters.Telly;

Game.objects.characters.Telly.prototype.updateAI = function()
{
    if (Math.abs(this.time - this.timeAIUpdated) < 1) {
        return;
    }

    this.timeAIUpdated = this.time;

    if (this.ai.findPlayer()) {
        if (this.ai.target.position.distanceTo(this.position) > 300) {
            return;
        }
        this.ai.faceTarget();
        this.velocity.x = 0;
        this.velocity.y = 0;
        var distX = this.position.x - this.ai.target.position.x;
        var distY = this.position.y - this.ai.target.position.y;
        this.velocity.x = distX > 0 ? -this.speed : this.speed;
        if (Math.abs(distY) > 16 || Math.random() < .25) {
            this.velocity.y = distY > 0 ? -this.speed : this.speed;
        }
    }
}

Game.objects.characters.Telly.prototype.timeShift = function(dt)
{
    this.updateAI(dt);
    this.sprites.setDirection(this.direction);
    this.sprites.timeShift(dt);
    Game.objects.Character.prototype.timeShift.call(this, dt);
}
