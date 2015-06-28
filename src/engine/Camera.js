Engine.Camera = function(camera)
{
    this.camera = camera;
    this.followObject = undefined;
    this.followOffset = new THREE.Vector2(0, 25);
    this.followLookAhead = new THREE.Vector2(.5, .2);
}

Engine.Camera.prototype.follow = function(object, distance)
{
    this.followObject = object;
}

Engine.Camera.prototype.jumpTo = function(x, y)
{
    this.unfollow();
    this.camera.position.x = x;
    this.camera.position.y = y;
}

Engine.Camera.prototype.panTo = function(x, y)
{
    this.camera.position.x = x;
    this.camera.position.y = y;
}

Engine.Camera.prototype.unfollow = function()
{
    this.followObject = undefined;
}

Engine.Camera.prototype.updateTime = function(timeElapsed)
{
    if (this.followObject) {
        this.panTo(this.followObject.model.position.x,
                   this.followObject.model.position.y);
    }
}
