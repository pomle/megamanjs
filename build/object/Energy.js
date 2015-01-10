Engine.assets.Energy = function(max)
{
    var self = this;
    self.min = 0;
    self.max = max;
    self.current = max;

    self.reduce = function(points)
    {
        self.current = Math.max(self.min, self.current - points);
    }

    self.refill = function(points)
    {
        self.current = Math.min(self.max, self.current + points);
    }
}
