Engine.Animator.UV = function()
{
    Engine.Animator.call(this);

    this._currentIndex = undefined;

    this.geometries = [];
    this.indices = [0];
}

Engine.Util.extend(Engine.Animator.UV, Engine.Animator);

Engine.Animator.UV.prototype._applyAnimation = function(animation)
{
    var animationIndex = animation.getIndex(this.time);
    if (animationIndex === this._currentIndex) {
        return;
    }

    var uv = animation.getValue(animationIndex),
        geos = this.geometries,
        indices = this.indices,
        l = geos.length,
        k = indices.length;
    for (var i = 0; i < l; ++i) {
        var geo = geos[i];
        for (var j = 0; j < k; ++j) {
            var faceIndex = indices[j];
            geo.faceVertexUvs[0][faceIndex] = uv[0];
            geo.faceVertexUvs[0][faceIndex+1] = uv[1];
        }
        geo.uvsNeedUpdate = true;
    }

    this._currentIndex = animationIndex;
}

Engine.Animator.UV.prototype.addGeometry = function(geometry)
{
    if (geometry instanceof THREE.Geometry === false) {
        throw new TypeError('Invalid geometry');
    }
    this.geometries.push(geometry);
}
