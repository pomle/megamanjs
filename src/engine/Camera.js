Engine.Camera = function(camera)
{
    this.camera = camera;
    this.desiredPosition = undefined;
    this.followObject = undefined;
    this.followOffset = new THREE.Vector2(0, 25);
    this.followLookAhead = new THREE.Vector2(.5, .2);
    this.smoothing = 20;
    this.velocity = new THREE.Vector2(0, 0);

}

Engine.Camera.prototype.follow = function(object, offset)
{
    this.followObject = object;
    if (offset) {
        this.followOffset = offset;
    } else {
        this.followOffset = new THREE.Vector2(0, 0);
    }

}

Engine.Camera.prototype.jumpTo = function(pos)
{
    this.unfollow();
    this.desiredPosition = undefined;
    this.camera.position.x = pos.x;
    this.camera.position.y = pos.y;
}

Engine.Camera.prototype.panTo = function(pos)
{
    this.desiredPosition = pos.clone();
}

Engine.Camera.prototype.unfollow = function()
{
    this.desiredPosition = undefined;
    this.followObject = undefined;
}

Engine.Camera.prototype.updateTime = function(timeElapsed)
{
    if (this.followObject) {
        if (!this.desiredPosition) {
            this.desiredPosition = new THREE.Vector2();
        }

        this.desiredPosition.x = this.followObject.position.x + this.followOffset.x;
        if (this.followObject.isSupported) {
            this.desiredPosition.y = this.followObject.position.y + this.followOffset.y;
        }
    }

    if (this.desiredPosition) {
        this.velocity = this.desiredPosition.clone().sub(this.camera.position);
        if (this.smoothing) {
            this.velocity.divideScalar(this.smoothing);
        }
    }

    this.camera.position.x += this.velocity.x;
    this.camera.position.y += this.velocity.y;
}
