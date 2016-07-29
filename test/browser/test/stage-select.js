'use strict';

describe('Stage Select', function() {
  before(function(done) {
    this.env = new TestEnv;
    this.env.loader.loadGame('../../../src/resource/Megaman2.xml')
      .then(() => {
        return this.env.loader.loadSceneByName('StageSelect');
      })
      .then(scene => {
        this.scene = scene;
        this.camera = scene.camera;
        done();
      });
  });

  after(function() {
    this.env.destroy();
  });

  it('should start zoomed in and then zoom out', function() {
    this.env.scene(this.scene);
    const camera = this.camera;
    expect(camera.position.z).to.be(40);
    this.env.time(1);
    this.env.game.render();
    expect(camera.position.z).to.be(140);
  });

  context('when stage selected', function() {
    it('should select Heatman stage when pressing left and start', function(done) {
      this.env.scene(this.scene);
      this.scene.events.once(this.scene.EVENT_STAGE_SELECTED, stage => {
        const Heatman = this.env.loader.resourceManager.get('object', 'Heatman');
        expect(stage.character).to.be(Heatman);
        done();
      });
      this.env.tap('left start');
    });

    it('camera should move to reveal boss', function() {
      this.env.time(3);
      this.env.game.render();
      expect(this.camera.position.y).to.be(440);
    });

    it('boss character should be in view', function() {
      const boss = this.scene.world.getObjects('Heatman')[0];
      expect(boss.position).to.eql({ x: 64, y: 436, z: 0});
    });

    it('should load Heatman level eventually', function(done) {
      this.env.game.events.once(this.env.game.EVENT_SCENE_SET, scene => {
        done();
      });
      this.env.time(7);
    });
  });
});
