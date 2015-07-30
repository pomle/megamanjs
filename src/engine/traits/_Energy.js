Engine.traits._Energy = function(max, min)
{
    this.min = min || 0;
    this.max = max || 100;
    this.value = this.max;
}

Engine.traits._Energy.prototype.deplete = function()
{
    this.setTo(this.min);
}

Engine.traits._Energy.prototype.fill = function()
{
    this.setTo(this.max);
}

Engine.traits._Energy.prototype.getAmount = function()
{
    return this.value;
}

Engine.traits._Energy.prototype.getFraction = function()
{
    if (this.value === undefined || this.max === this.min) {
        return 1;
    }
    else {
        return Math.abs(this.value - this.min) / Math.abs(this.max - this.min);
    }
}

Engine.traits._Energy.prototype.increase = function(points)
{
    return this.setTo(this.value + points);
}

Engine.traits._Energy.prototype.isDepleted = function()
{
    return this.value <= this.min;
}

Engine.traits._Energy.prototype.isFinite = function()
{
    return this.value !== undefined;
}

Engine.traits._Energy.prototype.reduce = function(points)
{
    return this.setTo(this.value - points);
}

Engine.traits._Energy.prototype.setFinite = function(value)
{
    this.value = 0;
    this.setTo(this.max);
}

Engine.traits._Energy.prototype.setInfinite = function()
{
    this.value = undefined;
}

Engine.traits._Energy.prototype.setMax = function(points)
{
    this.max = points;
    this.setTo(this.value);
}

Engine.traits._Energy.prototype.setMin = function(points)
{
    this.min = points;
    this.setTo(this.value);
}

Engine.traits._Energy.prototype.setTo = function(points)
{
    if (this.value === undefined) {
        return false;
    }
    if (points > this.max) {
        points = this.max;
    }
    else if (points < this.min) {
        points = this.min;
    }
    this.value = points;
    return true;
}
