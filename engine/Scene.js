var Scene = function()
{
    var self = this;
    self.collision = new Collision();
    self.objects = [];

    self.addObject = function(o)
    {
        self.objects.push(o);
        self.collision.objects.push(o);
    }

    self.updateTime = function(timeElapsed)
    {
        var i;
        for (i in self.objects) {
            self.objects[i].timeShift(timeElapsed);
        }
        self.collision.detect();
    }
}
