Engine.UVAnimator = function(timeline, geometry)
{
    if (timeline instanceof Engine.Timeline === false) {
        throw new Error('Invalid timeline');
    }

    if (geometry instanceof THREE.Geometry === false) {
        throw new Error('Invalid geometry');
    }

    this.isPlaying = false;
    this.geometry = geometry;
    this.timeline = timeline;
    this.timeline.addCallback(this.update.bind(this));
}

Engine.UVAnimator.prototype.pause = function()
{
    this.isPlaying = false;
}

Engine.UVAnimator.prototype.play = function()
{
    this.isPlaying = true;
}

Engine.UVAnimator.prototype.update = function(uvMap)
{
    this.geometry.faceVertexUvs[0] = uvMap;
    this.geometry.uvsNeedUpdate = true;
}
