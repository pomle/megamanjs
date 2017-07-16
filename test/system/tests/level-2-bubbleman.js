describe('Bubbleman Level', function() {
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

    it('starts Bubbleman stage when pressing up + left + start', function(done) {
      let started = false;
      env.game.events.once(env.game.EVENT_SCENE_SET, scene => {
        expect(scene.name).to.be('Bubbleman');
        started = true;
      });
      env.tap('up left start');
      env.waitUntil(() => started).then(done);
    });
  });

  context('Level', function() {
    before(function(done) {
      Promise.all([
        env.load('Bubbleman'),
        env.loadInput('/test/system/input/level-bubbleman.json'),
      ]).then(([scene, log]) => {
        env.scene(scene);
        env.playInput(log);
        done();
      });
    });

    after(function() {
      env.game.unsetScene();
    });

    it('should hide player off screen on start', function() {
      expect(env.game.player.character.position.y)
        .to.be.above(env.game.scene.camera.position.y + 120);
    });

    it('should teleport player to first checkpoint', function(done) {
      env.goToTime(2.5).then(() => {
        expect(env.game.player.character.position)
          .to.eql({x: 128, y: -101, z: 0});
        done();
      });
    });

    it('should have blocks that are solid and can be jumped from', function(done) {
      env.goToTick(1221).then(() => {
        expect(env.game.player.character.position)
          .to.eql({x: 772.7280559184165, y: -54.61095471377428, z: 0});
        done();
      });
    });

    it('enables player to get to other side of falling blocks', function(done) {
      env.goToTick(1609).then(() => {
        expect(env.game.player.character.position)
          .to.eql({x: 1054.7769542709652, y: -69, z: 0});
        done();
      });
    });

    it('falling blocks should have fallen away', function() {
      const blocks = env.game.scene.world.getObjects('falling-block');
      expect(blocks[0].position.y).to.be.below(-1000);
      expect(blocks[4].position.y).to.be.below(-300);
    });
  });
});
