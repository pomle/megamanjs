'use strict';

describe('Quickman Level', function() {
  before(function(done) {
    this.env = new TestEnv;
    this.env.loader.loadGame('../../../src/resource/Megaman2.xml')
      .then(() => this.env.load('StageSelect'))
      .then(scene => done());
  });

  after(function() {
    this.env.destroy();
  });

  context('StageSelect', function() {
    it('up + right should select stage', function() {
      this.env.tap('up right');
      this.env.game.render();
    });

    it('start should start stage', function(done) {
      this.env.game.events.once(this.env.game.EVENT_SCENE_SET, scene => done());
      this.env.tap('start');
      this.env.game.render();
      this.env.time(7);
    });
  });

  context('Level', function() {
    before(function(done) {
      this.env.useInput('./input/quickman-level.json').then(() => done());
    });

    it('should hide player off screen on start', function() {
      expect(this.env.game.player.character.position.y)
        .to.be.above(this.env.game.scene.camera.position.y + 120);
    });

    it('should teleport player to first checkpoint', function() {
      this.env.time(2.5);
      this.env.game.render();
      expect(this.env.game.player.character.position)
        .to.eql({x: 128, y: -152, z: 0});
    });

    it('scene should go dark when entering dark area', function() {
      this.env.time(16.5);
      this.env.game.render();
      expect(this.env.game.scene.world.ambientLight.color)
        .to.eql({r: 0.1, g: 0.03, b: 0.03});
    });

    it('scene should go light when exiting dark area', function() {
      this.env.time(12);
      this.env.game.render();
      expect(this.env.game.scene.world.ambientLight.color)
        .to.eql({r: 1, g: 1, b: 1});
    });

    it('player should reach end', function() {
      this.env.time(32);
      this.env.game.render();
      const pos = this.env.game.player.character.position;
      expect(pos.x).to.be.within(2120, 2160);
      expect(pos.y).to.be.within(-3760, -3720);
    });
  });
});
