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
    let player;

    before(function(done) {
      Promise.all([
        env.load('Crashman'),
        env.loadInput('/test/system/input/level-crashman.json'),
      ]).then(([scene, log]) => {
        env.scene(scene);
        env.playInput(log);
        player = env.game.player.character;
        done();
      }).catch(done);
    });

    describe('at start of level', () => {
      it('player is off screen', function() {
        expect(player.position).to.eql({x: 128, y: 256, z: 0});
      });

      it('camera is at start of level', function() {
        expect(env.game.scene.camera.position)
          .to.eql({x: 128, y: 120, z: 150});
      });
    });

    describe('after 2.1 seconds', () => {
      before(done => {
        env.goToTime(2.2).then(done);
      });

      it('player teleport is active', () => {
        expect(player.teleport.state).to.be(player.teleport.STATE_GO);
      });

      it('player is teleporting down', () => {
        expect(player.position.y).to.be.within(218, 219);
      });
    });

    describe('after 2.5 seconds', () => {
      before(done => {
        env.goToTime(2.6).then(done);
      });

      it('player is on the ground', () => {
        expect(player.position).to.eql({x: 128, y: 59, z: 0});
      });
    });

    describe.skip('after 90 seconds', () => {
      before(done => {
        env.goToTime(90).then(done);
      });

      it('player has reached end', () => {
        const pos = env.game.player.character.position;
        expect(pos.x).to.be.within(1288, 1536);
        expect(pos.y).to.be.within(3392, 3528);
      });
    });
  });
});
