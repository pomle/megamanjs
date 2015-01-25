Engine.Camera = function(camera)
{
    this.camera = camera;
    this.followObject = undefined;
    this.followTween = undefined;
    this.followOffset = new THREE.Vector2(0, 25);
    this.followLookAhead = new THREE.Vector2(.5, .2);
}

Engine.Camera.prototype.follow = function(object, distance)
{
    this.followObject = object;
    this.followTween = new TweenMax(this.camera.position, .5, {
        x: this.camera.position.x,
        y: this.camera.position.y,
    });
    //this.zoomTween = new TweenMax(this.camera.position, 3, {'z': this.followDistance});
}

Engine.Camera.prototype.jumpTo = function(x, y)
{
    this.unfollow();
    this.camera.position.x = x;
    this.camera.position.y = y;
}

Engine.Camera.prototype.panTo = function(x, y)
{
    this.followTween.updateTo({
        'x': x,
        'y': y
    }, true);
}

Engine.Camera.prototype.unfollow = function()
{
    this.followObject = undefined;
}

Engine.Camera.prototype.updateTime = function(timeElapsed)
{
    if (this.followObject) {
        var lookAhead = {
            x: this.followObject.speed.x * this.followLookAhead.x,
            y: this.followObject.speed.y * this.followLookAhead.y,
        }
        this.panTo(this.followObject.model.position.x + this.followOffset.x + lookAhead.x,
                   this.followObject.model.position.y + this.followOffset.y + lookAhead.y);
    }
}
