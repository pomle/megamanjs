describe('Dr Wily Level 1', function() {
  let player;

  context('Level', function() {
    before(function(done) {
      Promise.all([
        env.load('DrWily1'),
      ]).then(([scene]) => {
        env.scene(scene);
        player = env.game.player.character;
        done();
      });
    });

    after(function() {
      env.game.unsetScene();
    });

    after(function() {
      env.game.unsetScene();
    });

    describe('at start of stage', function() {
      it('player should be off screen', function() {
        expect(player.position)
          .to.eql({x: 128, y: 248, z: 0});
      });

      it('camera is at start of level', function() {
        expect(env.game.scene.camera.position)
          .to.eql({x: 128, y: 112, z: 150});
      });
    });

    describe('after ready text', function() {
      before(() => env.goToTime(2.5));

      it('player should be at start position', function() {
        expect(player.position)
          .to.eql({x: 128, y: 48, z: 0});
      });
    });
  });
});
