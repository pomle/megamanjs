Engine.UVAnimator = function(timeline, geometry, offset)
{
    if (timeline instanceof Engine.Timeline === false) {
        throw new Error('Invalid timeline');
    }

    if (geometry instanceof THREE.Geometry === false) {
        throw new Error('Invalid geometry');
    }

    this.faceIndices = [];
    this.geometry = geometry;
    this.timeline = timeline;
    this.update(timeline.getValueAtIndex(0));
    this.timeline.addCallback(this.update.bind(this), offset);
}

Engine.UVAnimator.prototype.addFaceIndex = function(index)
{
    this.faceIndices.push(index);
}

Engine.UVAnimator.prototype.update = function(uvMap)
{
    var i, faceIndex;
    for (i in this.faceIndices) {
        faceIndex = this.faceIndices[i];
        this.geometry.faceVertexUvs[0][faceIndex + 0] = uvMap[0];
        this.geometry.faceVertexUvs[0][faceIndex + 1] = uvMap[1];
    }
    this.geometry.uvsNeedUpdate = true;
}
