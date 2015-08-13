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

    var sprite = this.getSprite(label);

    // If same group, copy time position.
    if (sprite.group && sprite.group === this.sprite.group) {
        sprite.time = this.sprite.time;
    } else {
        sprite.time = 0;
    }

    this.sprite = sprite;
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
    var uvMap = Engine.SpriteManager.createUVMap(x, y, this.spriteW, this.spriteH, this.textureW, this.textureH);
    this.timeline.addFrame(uvMap, duration);
}

Engine.SpriteManager.createSprite = function(location, w, h, callback)
{
    var texture = Engine.TextureManager.getTexture('sprites/' + location, callback);
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

Engine.SpriteManager.createSingleTile = function(location, w, h, offsetX, offsetY, totalW, totalH)
{
    var model = Engine.SpriteManager.createSprite(location, w, h);
    var uvMap = Engine.SpriteManager.createUVMap(offsetX, offsetY, w, h, totalW, totalH);
    model.geometry.faceVertexUvs[0] = uvMap;
    return model;
}

Engine.SpriteManager.createTextSprite = function(string, align)
{
    var text = Engine.TextureManager.createText(string, align);
    var geometry = new THREE.PlaneGeometry(text.textSize.x, text.textSize.y);
    var material = new THREE.MeshBasicMaterial({
        side: THREE.FrontSide,
        map: text.texture,
        transparent: true,
    });
    var uvMap = this.createUVMap(0, 0, text.textSize.x, text.textSize.y, text.textureSize.x, text.textureSize.y);
    geometry.faceVertexUvs[0] = uvMap;
    geometry.faceVertexUvs[1] = uvMap;
    return new THREE.Mesh(geometry, material);
}

Engine.SpriteManager.createUVMap = function(x, y, w, h, totalW, totalH)
{
    /* Shave of a tiny bit from the UVMaps to avoid neighbor pixel shine-thru. */
    shave = 0;

    x += shave;
    y += shave;
    w -= shave * 2;
    h -= shave * 2;

    var uvs = [
        new THREE.Vector2(x / totalW, (totalH - y) / totalH),
        new THREE.Vector2(x / totalW, (totalH - (y + h)) / totalH),
        new THREE.Vector2((x + w) / totalW, (totalH - (y + h)) / totalH),
        new THREE.Vector2((x + w) / totalW, (totalH - y) / totalH),
    ];
    var uvMap = [
        [uvs[0], uvs[1], uvs[3]],
        [uvs[1], uvs[2], uvs[3]]
    ];
    return uvMap;
}
