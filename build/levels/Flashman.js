Engine.scenes.levels.Flashman = function()
{
    this.__proto__ = new Engine.scenes.Level();
    var self = this;
    self.backdrop = undefined;

    var texture = Engine.Util.getTexture('sprites/levels/flashman/level.gif', function(texture) {
        var material = new THREE.MeshLambertMaterial({});
        material.map = texture;

        var model = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(texture.image.width, texture.image.height),
            material
        );

        model.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(texture.image.width/2, -(texture.image.height/2), 0));

        self.backdrop = model;
        self.scene.add(model);
    });

    self.setStartPosition(128, 64);

    self.updateTime = function(timeElapsed)
    {
        self.__proto__.updateTime(timeElapsed);
    }
}
