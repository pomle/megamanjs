Engine.Camera = function(camera)
{
    this.camera = camera;
    this.followObject = undefined;
    this.followTween = undefined;
}

Engine.Camera.prototype.follow = function(object, distance)
{
    this.followObject = object;
    this.followTween = new TweenMax(this.camera.position, 1, {
        x: this.followObject.model.position.x,
        y: this.followObject.model.position.y
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
    if (this.followObject)
    {
        this.panTo(this.followObject.model.position.x, this.followObject.model.position.y);
        /*
        var newZ = this.followDistance + Math.max(Math.abs(this.followObject.speed.x), Math.abs(this.followObject.speed.y));
        this.zoomTween.updateTo({
            'z': newZ
        }, true);
        */
    }
}
