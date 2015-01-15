Engine.UVAnimator = function(timeline, geometry)
{
    if (timeline instanceof Engine.Timeline === false) {
        throw new Error('Invalid timeline');
    }

    if (geometry instanceof THREE.Geometry === false) {
        throw new Error('Invalid geometry');
    }

    var self = this;
    var isPlaying = false;

    self.pause = function()
    {
        isPlaying = false;
    }

    self.play = function()
    {
        isPlaying = true;
    }

    self.update = function()
    {
        geometry.faceVertexUvs[0] = timeline.getValue();
        geometry.uvsNeedUpdate = true;
    }

    timeline.onChange(self.update);
}
