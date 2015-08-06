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
        l = this.geometries.length,
        k = this.indices.length;
    for (var i = 0; i < l; ++i) {
        var geo = this.geometries[i];
        for (var j = 0; j < k; ++j) {
            geo.faceVertexUvs[0][j] = uv[0];
            geo.faceVertexUvs[0][j+1] = uv[1];
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
