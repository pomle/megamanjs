Game.ResourceManager = function()
{
    this.textureScale = 4;

    this.items = {};
}

Game.ResourceManager.prototype._addResource = function(type, name, object)
{
    if (!this.items[type]) {
        this.items[type] = {};
    }
    if (!name) {
        throw new Error('Empty name');
    }
    if (this.items[type][name]) {
        throw new Error("Object " + name + " already defined");
    }

    this.items[type][name] = object;
}

Game.ResourceManager.prototype.addWeapon = function(name, object)
{
    return this._addResource('weapon', name, object);
}

Game.ResourceManager.prototype.createTexture = function(location, callback)
{
    var texture = Engine.TextureManager.getScaledTexture(url, this.textureScale, callback);
    var material = new THREE.MeshBasicMaterial({
        //color: 0xffffff,
        //wireframe: true,
        side: THREE.DoubleSide,
        map: texture,
        transparent: true,
    });
    return texture;
}
