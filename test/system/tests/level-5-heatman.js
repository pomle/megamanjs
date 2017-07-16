describe('Heatman Level', function() {
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

    it('starts Heatman stage when pressing left + start', function(done) {
      let started = false;
      env.game.events.once(env.game.EVENT_SCENE_SET, scene => {
        expect(scene.name).to.be('Heatman');
        started = true;
      });
      env.tap('left start');
      env.waitUntil(() => started).then(done);
    });
  });

  context('Level', function() {
    let player;

    before(function(done) {
      Promise.all([
        env.load('Heatman'),
      ]).then(([scene]) => {
        env.scene(scene);
        player = env.game.player.character;
        done();
      });
    });

    after(function() {
      env.game.unsetScene();
    });

    describe('at start of level', () => {
      it('player is off screen', function() {
        expect(player.position).to.eql({x: 136, y: 35, z: 0});
      });

      it('camera is at start of level', function() {
        expect(env.game.scene.camera.position)
          .to.eql({x: 180, y: -120, z: 150});
      });
    });

    describe('after 2.2 seconds', () => {
      before(done => {
        env.goToTime(2.2).then(done);
      });

      it('player teleport is active', () => {
        expect(player.teleport.state).to.be(player.teleport.STATE_GO);
      });

      it('player is teleporting down', () => {
        expect(player.position.y).to.be.within(-3, -2);
      });
    });

    describe('after 2.6 seconds', () => {
      before(done => {
        env.goToTime(2.6).then(done);
      });

      it('player is on the ground', () => {
        expect(player.position)
          .to.eql({ x: 136, y: -165, z: 0 });
      });
    });

    describe('Level succession', function() {
      it.skip('disappearing blocks part 1 should be solvable', function() {
      });

      it.skip('disappearing blocks part 2 should be solvable', function() {
      });
    });
  });
});
