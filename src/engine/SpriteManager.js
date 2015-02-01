Engine.SpriteManager = function(model, spriteW, spriteH, textureW, textureH)
{
    this.spriteW = spriteW;
    this.spriteH = spriteH;
    this.textureW = textureW;
    this.textureH = textureH;

    this.accumulatedTime = 0;

    this.models = [model];
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

Engine.SpriteManager.prototype.applySprite = function(time)
{
    time = time || 0;
    var uvMap = this.sprite.timeline.getValueAtTime(time);
    var model;
    for (var i in this.models) {
        model = this.models[i];
        if (model.geometry.faceVertexUvs[0] == uvMap) {
            continue;
        }
        model.geometry.faceVertexUvs[0] = uvMap;
        model.geometry.uvsNeedUpdate = true;
    }
}

Engine.SpriteManager.prototype.getSprite = function(label)
{
    return this.sprites[label];
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

Engine.SpriteManager.prototype.setDirection = function(direction)
{
    var model;
    var s = direction < 0 ? -1 : 1;
    for (var i in this.models) {
        this.models[i].scale.x = s;
    }
}

Engine.SpriteManager.prototype.timeShift = function(dt)
{
    this.accumulatedTime += dt;
    this.sprite.time += dt;
    this.applySprite(this.sprite.time)
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
        map: texture,
        transparent: true,
    });
    var model = new THREE.Mesh(geometry, material);
    return model;
}
