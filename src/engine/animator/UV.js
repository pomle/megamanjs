'use strict';

Engine.Animator.UV =
class UVAnimator extends Engine.Animator
{
    constructor()
    {
        super();
        this.geometries = [];
        this.indices = [0];
    }

    _applyAnimation(animation)
    {
        const animationIndex = animation.getIndex(this.time + this.offset);
        if (animationIndex === this._currentIndex) {
            return;
        }

        const uv = animation.getValue(animationIndex);
        this.geometries.forEach(geo => {
            this.indices.forEach(faceIndex => {
                geo.faceVertexUvs[0][faceIndex] = uv[0];
                geo.faceVertexUvs[0][faceIndex+1] = uv[1];
            });
            geo.uvsNeedUpdate = true;
        });

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
        const anim = new Engine.Animator.UV();
        anim._currentAnimation = this._currentAnimation;
        anim._currentGroup = this._currentGroup;
        anim._currentIndex = this._currentIndex;
        anim.indices = this.indices;
        anim.offset = this.offset;
        anim.name = this.name;
        this.geometries.forEach(geo => anim.addGeometry(geo));
        return anim;
    }
}
