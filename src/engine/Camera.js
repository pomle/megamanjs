Engine.Camera = function(camera)
{
    this.camera = camera;
    this.desiredPosition = undefined;
    this.followObject = undefined;
    this.followOffset = new THREE.Vector2(0, 25);
    this.followLookAhead = new THREE.Vector2(.5, .2);
    this.smoothing = 20;

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
    this.followObject = undefined;
}

Engine.Camera.prototype.updateTime = function(timeElapsed)
{
    if (this.desiredPosition) {
        var move = this.desiredPosition.clone().sub(this.camera.position).divideScalar(this.smoothing);
        this.camera.position.x += move.x;
        this.camera.position.y += move.y;
    }

    if (this.followObject) {
        this.desiredPosition = this.followObject.position.clone().add(this.followOffset);
    }
}
