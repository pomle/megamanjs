Game.scenes.Cutscene = function(game, world)
{
    Game.Scene.call(this, game, world);

    this.world.camera.camera.position.z = 120;

    this.objects = {};

    this.sequenceIndex = -1;
    this.sequences = [];

    /* Hijack worlds time-legacy hack needs to go. */
    this.world.updateTime = this.updateTime.bind(this);
}

Engine.Util.extend(Game.scenes.Cutscene, Game.Scene);

Game.scenes.Cutscene.prototype.updateTime = function(dt)
{
    if (this.sequenceIndex !== -1) {
        if (!this.sequences[this.sequenceIndex]) {
            this.sequenceIndex = -1;
        }
        else if (this.sequences[this.sequenceIndex].call(this, dt)) {
            ++this.sequenceIndex;
        }
    }
}
