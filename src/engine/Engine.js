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
        var geometry = new THREE.PlaneGeometry(w, h);
        var material = new THREE.MeshBasicMaterial({
            //color: 0xffffff,
            //wireframe: true,
            map: texture,
            transparent: true,
        });
        var model = new THREE.Mesh(geometry, material);
        return model;
    },

    getTexture: function(url)
    {
        return Engine.Util.getScaledTexture(url, 4);
    },

    getScaledTexture: function(url, scale)
    {
        var canvas = document.createElement("canvas");
        var texture = new THREE.Texture(canvas);
        var image = new Image();
        image.onload = function() {
            var x = this.width * scale;
            var y = this.height * scale;
            canvas.width = x;
            canvas.height = y;
            var context = canvas.getContext("2d");
            context.imageSmoothingEnabled = false;
            context.drawImage(this, 0, 0, x, y);
            texture.needsUpdate = true;
        }
        image.src = url;
        return texture;
    },
}

Engine.assets = {};
