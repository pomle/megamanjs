Engine.Tween = function(properties, easing, duration)
{
    this.easing = easing || Engine.Easing.linear;
    this.objects = [];
    this.origins = [];
    this.desired = properties;
    this.duration = duration || 0;
    this.progress = 0;
}

Engine.Tween.prototype.addObject = function(object)
{
    this.objects.push(object);
    this.origins.push({});
    this.updateOrigin(this.origins.length - 1);
}

Engine.Tween.prototype.updateOrigin = function(i)
{
    var object = this.objects[i],
        origins = this.origins[i];
    for (var prop in this.desired) {
        origins[prop] = object[prop];
    }
}

Engine.Tween.prototype.updateOrigins = function()
{
    for (var i = 0, l = this.objects.length; i !== l; ++i) {
        this.updateOrigin(i);
    }
}

Engine.Tween.prototype.updateTime = function(deltaTime)
{
    var frac = undefined;
    this.progress += deltaTime;
    if (this.progress <= 0) {
        frac = 0;
    }
    else if (this.progress >= this.duration) {
        frac = 1;
    }
    else {
        frac = this.progress / this.duration;
    }
    this.updateValue(frac);
}

Engine.Tween.prototype.updateValue = function(progressFrac)
{
    var desired = this.desired,
        frac = this.easing(progressFrac);
    for (var i = 0, l = this.objects.length; i !== l; ++i) {
        var object = this.objects[i],
            origin = this.origins[i];
        for (var key in desired) {
            object[key] = origin[key] + (desired[key] - origin[key]) * frac;
        }
    }
}

