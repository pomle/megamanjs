'use strict';

Engine.Camera =
class Camera
{
    constructor()
    {
        this.EVENT_UPDATE = 'update';

        this.camera = new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000);
        this.desiredPosition = undefined;
        this.events = new Engine.Events(this);
        this.followObject = undefined;
        this.followOffset = new THREE.Vector2(0, 0);
        this.obeyPaths = true;
        this.paths = [];
        this.pathIndex = -1;
        this.position = this.camera.position;
        this.smoothing = 20;
        this.velocity = new THREE.Vector3(0, 0, 0);

        this.doFor = Engine.Loops.doFor(this.events, this.EVENT_UPDATE);
    }
    addPath(path)
    {
        if (path instanceof Engine.Camera.Path === false) {
            throw new TypeError("Invalid camera path");
        }
        this.paths.push(path);
    }
    alignToPath(pos)
    {
        if (this.paths.length === 0) {
            return false;
        }

        this.findPath(pos);

        if (this.pathIndex !== -1) {
            this.paths[this.pathIndex].constrain(pos);
        }

        return true;
    }
    findPath(pos)
    {
        /* If we're inside current path, don't look for a new one. */
        if (this.pathIndex !== -1 && this.paths[this.pathIndex].inWindow(pos)) {
            return;
        }

        for (let i = 0, l = this.paths.length; i !== l; ++i) {
            const path = this.paths[i];
            if (path.inWindow(pos)) {
                this.pathIndex = i;
                return;
            }
        }

        return;
    }
    follow(object, offset)
    {
        this.followObject = object;
        this.desiredPosition = object.position.clone();
        this.desiredPosition.z = this.position.z;
        if (offset === undefined) {
            this.followOffset.set(0, 0);
        } else {
            this.followOffset.copy(offset);
        }
    }
    focusAt(vec)
    {
        this.desiredPosition = vec.clone();
    }
    jumpTo(vec)
    {
        this.position.x = vec.x;
        this.position.y = vec.y;
        this.position.z = vec.z || this.position.z;
    }
    jumpToPath(vec)
    {
        this.jumpTo(vec);
        this.alignToPath(this.position);
    }
    panTo(pos, duration, easing = Engine.Easing.linear())
    {
        this.desiredPosition = undefined;
        const tween = new Engine.Tween(pos, easing);
        tween.addSubject(this.position);
        return this.doFor(duration, (elapsed, progress) => {
            tween.update(progress);
        });
    }
    unfollow()
    {
        this.followObject = undefined;
        this.desiredPosition = undefined;
    }
    updateTime(deltaTime)
    {
        this.events.trigger(this.EVENT_UPDATE, [deltaTime]);

        if (this.followObject) {
            this.desiredPosition.x = this.followObject.position.x + this.followOffset.x;
            this.desiredPosition.y = this.followObject.position.y + this.followOffset.y;
        }

        if (this.desiredPosition) {
            if (this.obeyPaths) {
                this.alignToPath(this.desiredPosition);
            }
            this.velocity.copy(this.desiredPosition).sub(this.position);
            if (this.smoothing > 0) {
                this.velocity.divideScalar(this.smoothing);
            }
        }

        this.position.add(this.velocity);
    }
}

Engine.Camera.Path = class CameraPath
{
    constructor()
    {
        this.constraint = [
            new THREE.Vector3(),
            new THREE.Vector3(),
        ];
        this.window = [
            new THREE.Vector2(),
            new THREE.Vector2(),
        ];
    }
    constrain(vec)
    {
        vec.clamp(this.constraint[0], this.constraint[1]);
    }
    inWindow(vec)
    {
        return vec.x >= this.window[0].x
            && vec.x <= this.window[1].x
            && vec.y >= this.window[0].y
            && vec.y <= this.window[1].y;
    }
    setConstraint(x1, y1, x2, y2)
    {
        this.constraint[0].x = x1;
        this.constraint[0].y = y1;
        this.constraint[1].x = x2;
        this.constraint[1].y = y2;
    }
    setWindow(x1, y1, x2, y2)
    {
        this.window[0].x = x1;
        this.window[0].y = y1;
        this.window[1].x = x2;
        this.window[1].y = y2;
    }
}
