Engine.assets.Energy = function(value, max, min)
{
    this.min = min || 0;
    this.max = max || 100;
    this.value = value;
}

Engine.assets.Energy.prototype.change = function(diff)
{
    if (diff != 0 && !isFinite(this.value)) {
        return false;
    }
    if (diff > 0) {
        this.value = Math.min(this.max, this.value + diff);
    }
    else {
        this.value = Math.max(this.min, this.value + diff);
    }
    return true;
}

Engine.assets.Energy.prototype.reduce = function(points)
{
    return this.change(-points);
}

Engine.assets.Energy.prototype.refill = function(points)
{
    return this.change(points);
}
