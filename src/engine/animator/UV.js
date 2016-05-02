'use strict';

Engine.Animator.UV = class UVAnimator extends Engine.Animator
{
    constructor()
    {
        super();
        this.geometries = [];
        this.indices = [0];
    }

    _applyAnimation(animation)
    {
        var animationIndex = animation.getIndex(this.time + this.offset);
        if (animationIndex === this._currentIndex) {
            return;
        }

        var uv = animation.getValue(animationIndex),
            geos = this.geometries,
            indices = this.indices,
            l = geos.length,
            k = indices.length;
        for (var i = 0; i !== l; ++i) {
            var geo = geos[i];
            for (var j = 0; j !== k; ++j) {
                var faceIndex = indices[j];
                geo.faceVertexUvs[0][faceIndex] = uv[0];
                geo.faceVertexUvs[0][faceIndex+1] = uv[1];
            }
            geo.uvsNeedUpdate = true;
        }

        this._currentIndex = animationIndex;
    }

    addGeometry(geometry)
    {
        if (geometry instanceof THREE.Geometry === false) {
            throw new TypeError('Invalid geometry');
        }
        this.geometries.push(geometry);
    }

    clone(animation)
    {
        var anim = new Engine.Animator.UV();
        anim._currentAnimation = this._currentAnimation;
        anim._currentId = this._currentId;
        anim.animations = this.animations;
        anim.indices = this.indices;
        anim.offset = this.offset;
        anim.name = this.name;
        for (var i in this.geometries) {
            anim.addGeometry(this.geometries[i]);
        }
        return anim;
    }
}
