var Engine = function(renderer)
{
    this.renderer = renderer;
    this.scene = undefined;
    this.timer = undefined;
}

Engine.prototype.run = function()
{
    if (this.scene) {
        this.timer.callbacks.push(this.timeShift.bind(this));
    }
    this.timer.start();
}

Engine.prototype.pause = function()
{
    this.timer.stop();
    this.timer.callbacks = [];
}

Engine.prototype.render = function()
{
    renderer.render(this.scene.scene, this.scene.camera.camera);
}

Engine.prototype.timeShift = function(timeElapsed)
{
    this.scene.updateTime(timeElapsed);
    this.scene.camera.updateTime(timeElapsed);
    this.render();
}

Engine.Util = {
    createSprite: function(location, w, h)
    {
        var texture = Engine.Util.getTexture('sprites/' + location);
        var geometry = new THREE.PlaneBufferGeometry(w, h);
        var material = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true
        });
        var model = new THREE.Mesh(geometry, material);
        return model;
    },

    getTexture: function(url, callback)
    {
        var texture = THREE.ImageUtils.loadTexture(url, null, callback);
        //texture.magFilter = THREE.NearestFilter;
        return texture;
    }
}

Engine.assets = {};
