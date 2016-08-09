'use strict';
'use strict';

describe('Bubbleman Level', function() {
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
    it('up + left should select stage', function() {
      this.env.tap('up left');
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
      this.env.useInput('./input/level-bubbleman.json').then(() => done());
    });

    it('should hide player off screen on start', function() {
      expect(this.env.game.player.character.position.y)
        .to.be.above(this.env.game.scene.camera.position.y + 120);
    });

    it('should teleport player to first checkpoint', function() {
      this.env.time(2.5);
      this.env.game.render();
      expect(this.env.game.player.character.position)
        .to.eql({x: 128, y: -101, z: 0});
    });

    it('should have blocks that fall away after jumped on', function() {
      this.env.time(16.5);
      this.env.game.render();
      expect(this.env.game.scene.world.ambientLight.color)
        .to.eql({r: 0.1, g: 0.03, b: 0.03});
    });
  });
});
