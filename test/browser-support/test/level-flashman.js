'use strict';

describe('Flashman Level', function() {
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

    it('starts Flashman stage when pressing down + start', function(done) {
      let started = false;
      env.game.events.once(env.game.EVENT_SCENE_SET, scene => {
        expect(scene.name).to.be('Flashman');
        started = true;
      });
      env.tap('down start');
      env.waitUntil(() => started).then(done);
    });
  });

  describe('Level', function() {
    before(function(done) {
      Promise.all([
        env.load('Flashman'),
        env.loadInput('./input/level-flashman.json'),
      ]).then(([scene, log]) => {
        env.scene(scene);
        env.useInput(log);
        done();
      });
    });

    after(function() {
      env.game.unsetScene();
    });

    describe('at start of stage', function() {
      it('player should be off screen', function() {
        expect(env.game.player.character.position)
          .to.eql({x: 136, y: 48, z: 0});
      });
    });

    describe('after ready text', function() {
      before(done => env.waitTime(2.5).then(done));

      it('player should be at start position', function() {
        expect(env.game.player.character.position)
          .to.eql({x: 136, y: -152, z: 0});
      });
    });

    describe('after 80 seconds', function() {
      before(done => env.waitTime(80).then(done));

      it('player should reach a position', function() {
        const pos = env.game.player.character.position;
        expect(pos.x).to.be.within(3100, 3300);
        expect(pos.y).to.be.within(-1840, -1800);
      });
    });
  });
});
