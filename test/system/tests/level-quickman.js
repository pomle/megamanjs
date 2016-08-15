'use strict';

describe('Quickman Level', function() {
  this.timeout(120000);

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

    it('starts Quickman stage when pressing up + right + start', function(done) {
      let started = false;
      env.game.events.once(env.game.EVENT_SCENE_SET, scene => {
        expect(scene.name).to.be('Quickman');
        started = true;
      });
      env.tap('up right start');
      env.waitUntil(() => started).then(done);
    });
  });

  context('Level', function() {
    before(function(done) {
      Promise.all([
        env.load('Quickman'),
        env.loadInput('./input/level-quickman.json'),
      ]).then(([scene, log]) => {
        env.scene(scene);
        env.playInput(log);
        done();
      });
    });

    after(function() {
      env.game.unsetScene();
    });

    it('camera placed correctly', function() {
      expect(env.game.scene.camera.position)
        .to.eql({x: 128, y: -120, z: 150});
    });

    it('should hide player off screen on start', function() {
      expect(env.game.player.character.position)
        .to.eql({x: 128, y: 48, z: 0});
    });

    it('should teleport player to first checkpoint', function(done) {
      env.goToTime(2.5).then(() => {
        expect(env.game.player.character.position)
          .to.eql({x: 128, y: -152, z: 0});
        done();
      });
    });

    it('scene should go dark when entering dark area', function(done) {
      env.goToTime(19).then(() => {
        expect(env.game.scene.world.ambientLight.color)
          .to.eql({r: 0.1, g: 0.03, b: 0.03});
        done();
      });
    });

    it('scene should go light when exiting dark area', function(done) {
      env.goToTime(31).then(() => {
        expect(env.game.scene.world.ambientLight.color)
          .to.eql({r: 1, g: 1, b: 1});
        done();
      });
    });

    it('player should reach end', function(done) {
      env.goToTime(64).then(() => {
        const pos = env.game.player.character.position;
        expect(pos.x).to.be.within(2120, 2180);
        expect(pos.y).to.be.within(-3780, -3720);
        done();
      });
    });
  });
});
