Engine.assets.Event = function()
{
    Engine.assets.Object.call(this);
    this.engine = undefined;
    this.mass = 0;
    this.pauseTime = undefined;
    this.objectsSeen = [];
    this.multiplier = 2;
}

Engine.assets.Event.prototype = Object.create(Engine.assets.Object.prototype);
Engine.assets.Event.constructor = Engine.assets.Event;

Engine.assets.Event.prototype.collides = function(subject)
{
    //console.log('%s collides %s', subject, this);
    if (subject instanceof Engine.assets.objects.Character && subject.isPlayer) {
        if (this.objectsSeen.indexOf(subject) == -1) {
            subject.timeStretch /= this.multiplier;
            this.objectsSeen.push(subject);
        }
        //subject.timeShift(subject.deltaTime);
        //console.log('%s collides with %s', subject, this);
        //this.engine.simulationSpeed = .2;
        //this.pauseTime = this.time;
    }
}

Engine.assets.Event.prototype.uncollides = function(subject)
{
    //console.log('%s uncollides %s', subject, this);
    if (subject instanceof Engine.assets.objects.Character && subject.isPlayer) {
        var i = this.objectsSeen.indexOf(subject);
        if (i != -1) {
            subject.timeStretch *= this.multiplier;
            this.objectsSeen.splice(i, 1);
        }
        //subject.timeStretch = 1;
    }
}

Engine.assets.Event.prototype.timeShift = function(dt)
{
}

Engine.assets.events = {

};
