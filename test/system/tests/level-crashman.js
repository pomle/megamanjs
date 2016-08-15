'use strict';

describe('Crashman Level', function() {
  context('StageSelect', function() {
    before(function(done) {
      env.load('StageSelect').then(scene => {
        env.scene(scene);
        done();
      });
    });

    after(function() {
      env.game.unsetScene();
    });

    it('starts Crashman stage when pressing down + right + start', function(done) {
      let started = false;
      env.game.events.once(env.game.EVENT_SCENE_SET, scene => {
        expect(scene.name).to.be('Crashman');
        started = true;
      });
      env.tap('down right start');
      env.waitUntil(() => started).then(done);
    });
  });

  context('Level', function() {
    before(function(done) {
      Promise.all([
        env.load('Crashman'),
        env.loadInput('/base/test/system/input/level-crashman.json'),
      ]).then(([scene, log]) => {
        env.scene(scene);
        env.playInput(log);
        done();
      });
    });

    it('should hide player off screen on start', function() {
      expect(env.game.player.character.position.y)
        .to.be.above(env.game.scene.camera.position.y + 120);
    });

    it('should teleport player to first checkpoint', function(done) {
      env.waitTime(2.5).then(() => {
        expect(env.game.player.character.position)
          .to.eql({x: 128, y: 56, z: 0});
        done();
      });
    });

    it.skip('player should reach end', function(done) {
      env.waitTime(90).then(() => {
        const pos = env.game.player.character.position;
        expect(pos.x).to.be.within(1288, 1536);
        expect(pos.y).to.be.within(3392, 3528);
        done();
      });
    });
  });
});
