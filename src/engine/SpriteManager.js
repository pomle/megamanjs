Engine.SpriteManager = function(model, spriteW, spriteH, textureW, textureH)
{
    this.spriteW = spriteW;
    this.spriteH = spriteH;
    this.textureW = textureW;
    this.textureH = textureH;

    this.accumulatedTime = 0;

    this.model = model;
    this.sprites = {};
    this.label = undefined;
    this.group = undefined;
    this.sprite = undefined;
}

Engine.SpriteManager.prototype.addSprite = function(label, group)
{
    if (this.sprites[label]) {
        throw new Error('Sprite "' + label + '" already defined');
    }

    this.sprites[label] = new Engine.SpriteManager.UVAnimator(
        new Engine.Timeline(),
        this.spriteW, this.spriteH,
        this.textureW, this.textureH);

    this.sprites[label].group = group;

    return this.getSprite(label);
}

Engine.SpriteManager.prototype.selectSprite = function(label)
{
    if (label == this.label) {
        return;
    }

    this.sprite = this.getSprite(label);

    // Reset timeline unless same group.
    if (this.sprite.group != this.group) {
        this.sprite.rewind();
    }

    this.group = this.sprite.group;

    this.label = label;
}

Engine.SpriteManager.prototype.getSprite = function(label)
{
    return this.sprites[label];
}

Engine.SpriteManager.prototype.setDirection = function(direction)
{
    if (direction < 0) {
        this.model.scale.x = -1;
    }
    else {
        this.model.scale.x = 1;
    }
}

Engine.SpriteManager.prototype.timeShift = function(dt)
{
    this.accumulatedTime += dt;
    this.sprite.time += dt;

    var uvMap = this.sprite.timeline.getValueAtTime(this.sprite.time);
    if (this.model.geometry.faceVertexUvs[0] == uvMap) {
        return;
    }

    this.model.geometry.faceVertexUvs[0] = uvMap;
    this.model.geometry.uvsNeedUpdate = true;
}


Engine.SpriteManager.UVAnimator = function(timeline, spriteW, spriteH, textureW, textureH)
{
    this.spriteW = spriteW;
    this.spriteH = spriteH;
    this.textureW = textureW;
    this.textureH = textureH;

    this.group = undefined; // Groups share timeline time.
    this.timeline = timeline;
    this.time = 0;
}

Engine.SpriteManager.UVAnimator.prototype.addFrame = function(x, y, duration)
{
    var uvMap = Engine.Util.createUVMap(x, y, this.spriteW, this.spriteH, this.textureW, this.textureH);
    this.timeline.addFrame(uvMap, duration);
}

Engine.SpriteManager.UVAnimator.prototype.rewind = function()
{
    this.time = 0;
}

Engine.SpriteManager.createSprite = function(location, w, h)
{
    var texture = Engine.Util.getTexture('sprites/' + location);
    var geometry = new THREE.PlaneGeometry(w, h);
    var material = new THREE.MeshBasicMaterial({
        //color: 0xffffff,
        //wireframe: true,
        side: THREE.DoubleSide,
        map: texture,
        transparent: true,
    });
    var model = new THREE.Mesh(geometry, material);
    return model;
}
