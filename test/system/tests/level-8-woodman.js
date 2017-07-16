describe('Woodman Level', function() {
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

    it('starts Woodman stage when pressing right + start', function(done) {
      let started = false;
      env.game.events.once(env.game.EVENT_SCENE_SET, scene => {
        expect(scene.name).to.be('Woodman');
        started = true;
      });
      env.tap('right start');
      env.waitUntil(() => started).then(done);
    });
  });

  context('Level', function() {
    let player;

    before(function(done) {
      Promise.all([
        env.load('Woodman'),
      ]).then(([scene]) => {
        env.scene(scene);
        player = env.game.player.character;
        done();
      });
    });

    after(function() {
      env.game.unsetScene();
    });

    describe('at start of stage', function() {
      it('player should be off screen', function() {
        expect(player.position)
          .to.eql({x: 128, y: 16, z: 0});
      });
    });

    describe('after ready text', function() {
      before(done => env.goToTime(2.5).then(done));

      it('player should be at start position', function() {
        expect(player.position)
          .to.eql({x: 128, y: -184, z: 0});
      });
    });
  });
});
