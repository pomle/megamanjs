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
    var index = animation.getIndex(this.time);
    if (index === this._currentIndex) {
        return;
    }

    var uv = animation.getValue(index),
        geos = this.geometries,
        indices = this.indices,
        l = geos.length,
        k = indices.length;
    for (var i = 0; i < l; ++i) {
        var geo = geos[i];
        for (var j = 0; j < k; ++j) {
            var index = indices[j];
            geo.faceVertexUvs[0][index] = uv[0];
            geo.faceVertexUvs[0][index+1] = uv[1];
        }
        geo.uvsNeedUpdate = true;
    }

    this._currentIndex = index;
}

Engine.Animator.UV.prototype.addGeometry = function(geometry)
{
    if (geometry instanceof THREE.Geometry === false) {
        throw new TypeError('Invalid geometry');
    }
    this.geometries.push(geometry);
}
