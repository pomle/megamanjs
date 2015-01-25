Engine.UVAnimator = function(timeline, geometry, faceIndex, offset)
{
    if (timeline instanceof Engine.Timeline === false) {
        throw new Error('Invalid timeline');
    }

    if (geometry instanceof THREE.Geometry === false) {
        throw new Error('Invalid geometry');
    }

    this.geometry = geometry;
    this.timeline = timeline;
    this.faceIndex = (faceIndex * 2) || 0;
    this.update(timeline.getValueAtIndex(0));
    this.timeline.addCallback(this.update.bind(this), offset);
}

Engine.UVAnimator.prototype.update = function(uvMap)
{
    this.geometry.faceVertexUvs[0][this.faceIndex+0] = uvMap[0];
    this.geometry.faceVertexUvs[0][this.faceIndex+1] = uvMap[1];
    this.geometry.uvsNeedUpdate = true;
}
