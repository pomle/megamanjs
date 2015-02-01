Engine.assets.Energy = function(max, min)
{
    this.min = min || 0;
    this.max = max || 100;
    this.value = this.max;

    this.event = function() {};
}

Engine.assets.Energy.prototype.change = function(diff)
{
    if (diff != 0 && !isFinite(this.value)) {
        return false;
    }
    var change = this.value;
    if (diff > 0) {
        this.value = Math.min(this.max, this.value + diff);
    }
    else {
        this.value = Math.max(this.min, this.value + diff);
    }
    if (this.value != change) {
        this.event(this);
    }
    return true;
}

Engine.assets.Energy.prototype.depleted = function()
{
    return this.fraction() == 0;
}

Engine.assets.Energy.prototype.finite = function(value)
{
    if (isFinite(value)) {
        this.value = value;
    }
    else {
        this.value = undefined;
    }
}

Engine.assets.Energy.prototype.fraction = function()
{
    return isFinite(this.value) ? this.value / this.max : 1;
}

Engine.assets.Energy.prototype.reduce = function(points)
{
    return this.change(-points);
}

Engine.assets.Energy.prototype.refill = function(points)
{
    return this.change(points);
}
