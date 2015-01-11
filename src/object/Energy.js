Engine.assets.Energy = function(max)
{
    this.min = 0;
    this.max = max;
    this.current = max;
}

Engine.assets.Energy.prototype.reduce = function(points)
{
    this.current = Math.max(this.min, this.current - points);
}

Engine.assets.Energy.prototype.refill = function(points)
{
    this.current = Math.min(this.max, this.current + points);
}
