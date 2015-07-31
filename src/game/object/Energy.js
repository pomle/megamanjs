Game.objects.Energy = function(max, min)
{
    this.min = min || 0;
    this.max = max || 100;
    this.value = this.max;

    this.event = function() {};
}

Game.objects.Energy.prototype.deplete = function()
{
    this.setTo(this.min);
}

Game.objects.Energy.prototype.fill = function()
{
    this.setTo(this.max);
}

Game.objects.Energy.prototype.getAmount = function()
{
    return this.value;
}

Game.objects.Energy.prototype.getFraction = function()
{
    if (this.value === undefined || this.max === this.min) {
        return 1;
    }
    else {
        return Math.abs(this.value - this.min) / Math.abs(this.max - this.min);
    }
}

Game.objects.Energy.prototype.increase = function(points)
{
    return this.setTo(this.value + points);
}

Game.objects.Energy.prototype.isDepleted = function()
{
    return this.value <= this.min;
}

Game.objects.Energy.prototype.isFinite = function()
{
    return this.value !== undefined;
}

Game.objects.Energy.prototype.reduce = function(points)
{
    return this.setTo(this.value - points);
}

Game.objects.Energy.prototype.setFinite = function(value)
{
    this.value = 0;
    this.setTo(this.max);
}

Game.objects.Energy.prototype.setInfinite = function()
{
    this.value = undefined;
}

Game.objects.Energy.prototype.setMax = function(points)
{
    this.max = points;
    this.setTo(this.value);
}

Game.objects.Energy.prototype.setMin = function(points)
{
    this.min = points;
    this.setTo(this.value);
}

Game.objects.Energy.prototype.setTo = function(points)
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
    this.event(this);
    return true;
}
