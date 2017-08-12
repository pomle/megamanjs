describe('Metalman Level', function() {
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

    it('starts Metalman stage when pressing down + left + start', function(done) {
      let started = false;
      env.game.events.once(env.game.EVENT_SCENE_SET, scene => {
        expect(scene.name).to.be('Metalman');
        started = true;
      });
      env.tap('down left start');
      env.waitUntil(() => started).then(done);
    });
  });

  context('Level', function() {
    let player;

    before(function(done) {
      Promise.all([
        env.load('Metalman'),
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
          .to.eql({x: 128, y: 32, z: 0});
      });
    });

    describe('after ready text', function() {
      before(() => env.goToTime(2.5));

      it('player should be at start position', function() {
        expect(player.position)
          .to.eql({x: 128, y: -168, z: 0});
      });
    });

    describe.skip('one second after start', function() {
      before(done => env.waitTime(1).then(done));

      it('player should have been moved by conveyor', function() {
        expect(player.position)
          .to.eql({x: 128, y: -168, z: 0});
      });
    });
  });
});
