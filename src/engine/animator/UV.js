Engine.Animator.UV = function()
{
    Engine.Animator.call(this);

    this._currentIndex = undefined;

    this.meshes = [];
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
        l = this.meshes.length,
        k = this.indices.length;
    for (var i = 0; i < l; ++i) {
        var geo = this.meshes[i].geometry;
        for (var j = 0; j < k; ++j) {
            geo.faceVertexUvs[j] = uv;
        }
        geo.uvsNeedUpdate = true;
    }

    this._currentIndex = index;
}

Engine.Animator.UV.prototype.addMesh = function(mesh)
{
    if (mesh instanceof THREE.Mesh === false) {
        throw new TypeError('Invalid mesh');
    }
    this.meshes.push(mesh);
}
