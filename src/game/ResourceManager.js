Game.ResourceManager = function()
{
    this.textureScale = 4;

    /* These must be defined in order of specificity. */
    this.typeMap = {
        'character': Game.objects.Character,
        'weapon': Game.objects.Weapon,
        'object': Engine.Object,
        'texture': THREE.Texture,
    }

    this.items = {};
}

Game.ResourceManager.prototype._addResource = function(type, id, object)
{
    if (!type) {
        throw new Error('Empty type');
    }
    if (!id) {
        throw new Error('Empty id');
    }
    if (!this.items[type]) {
        this.items[type] = {};
    }
    if (this.items[type][id]) {
        throw new Error("Object " + id + " already defined");
    }

    this.items[type][id] = object;
}

Game.ResourceManager.prototype.addAuto = function(id, object)
{
    for (var type in this.typeMap) {
        var proto = this.typeMap[type].prototype;
        if (proto.isPrototypeOf(object.prototype)) {
            this._addResource(type, id, object);
            return true;
        }
    }
    throw new Error('Could not determine type from ' + object);
}

Game.ResourceManager.prototype.addCharacter = function(id, object)
{
    return this._addResource('character', id, object);
}

Game.ResourceManager.prototype.addTexture = function(id, object)
{
    return this._addResource('texture', id, object);
}

Game.ResourceManager.prototype.addWeapon = function(id, object)
{
    return this._addResource('weapon', id, object);
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

Game.ResourceManager.prototype.get = function(type, id)
{
    if (this.items[type] && this.items[type][id]) {
        return this.items[type][id];
    }
    throw new Error('Could not find resource "' + id + '" of type "' + type + '"');
}
