'use strict';

describe('Stage Select', function() {

  before(function(done) {
    env.load('StageSelect').then(scene => {
      env.scene(scene);
      done();
    });
  });

  after(function() {
    env.game.unsetScene();
  });

  it('should start zoomed in and then zoom out', function(done) {
    const camera = env.game.scene.camera;
    expect(camera.position.z).to.be(40);
    env.waitTime(1).then(() => {
      expect(camera.position.z).to.be(140);
      done();
    });
  });

  context('when stage selected', function() {
    it('should select Heatman stage when pressing left and start', function(done) {
      const scene = env.game.scene;
      scene.events.once(scene.EVENT_STAGE_SELECTED, stage => {
        const Heatman = env.loader.resourceManager.get('object', 'Heatman');
        expect(stage.character).to.be(Heatman);
        done();
      });
      env.tap('left start');
    });

    it('camera should move to reveal boss', function(done) {
      env.waitTime(3).then(() => {
        expect(env.game.scene.camera.position.y).to.be(440);
        done();
      });
    });

    it('boss character should be in view', function() {
      const boss = env.game.scene.world.getObjects('Heatman')[0];
      expect(boss.position).to.eql({ x: 64, y: 436, z: 0});
    });

    it('should load Heatman level eventually', function(done) {
      let started = false;
      env.game.events.once(env.game.EVENT_SCENE_SET, scene => {
        started = true;
      });
      env.waitUntil(() => started).then(done);
    });
  });
});
