Engine.Animator.UV = function()
{
    Engine.Animator.call(this);
    this.meshes = [];
}

Engine.Util.extend(Engine.Animator.UV, Engine.Animator);

Engine.Animator.UV.prototype._applyAnimation = function(animation)
{
    var uv = animation.getValue();
    for (var i = 0, l = this.meshes.length; i < l; ++i) {
        var geo = this.meshes[i].geometry;
        if (uv !== geo.faceVertexUvs[0]) {
            geo.faceVertexUvs[0] = uv;
            geo.uvsNeedUpdate = true;
        }
    }
}

Engine.Animator.UV.prototype.addMesh = function(mesh)
{
    if (mesh instanceof THREE.Mesh === false) {
        throw new TypeError('Invalid mesh');
    }
    this.meshes.push(mesh);
}
