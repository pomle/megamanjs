'use strict';

describe('Crashman Level', function() {
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
    it('down + right should select stage', function() {
      this.env.tap('down right start');
      this.env.game.render();
    });

    it('camera should move to reveal boss', function() {
      this.env.time(3);
      this.env.game.render();
      expect(this.env.game.scene.camera.position.y).to.be(440);
    });

    it('boss character should be in view', function() {
      const boss = this.env.game.scene.world.getObjects('Crashman')[0];
      expect(boss.position).to.eql({ x: 64, y: 436, z: 0});
    });

    it('should load Crashman level eventually', function(done) {
      this.env.game.events.once(this.env.game.EVENT_SCENE_SET, scene => done());
      this.env.time(7);
    });
  });

  context('Level', function() {
    before(function(done) {
      this.env.useInput('./input/crashman-level.json').then(() => done());
    });

    it('should hide player off screen on start', function() {
      expect(this.env.game.player.character.position.y)
        .to.be.above(this.env.game.scene.camera.position.y + 120);
    });

    it('should teleport player to first checkpoint', function() {
      this.env.time(2.5);
      this.env.game.render();
      expect(this.env.game.player.character.position)
        .to.eql({x: 128, y: 56, z: 0});
    });

    it('player should reach end', function() {
      this.timeout(10000);
      this.env.time(90);
      const pos = this.env.game.player.character.position;
      expect(pos.x).to.be.within(650, 700);
      expect(pos.y).to.be.within(1780, 1820);
    });
  });
});
