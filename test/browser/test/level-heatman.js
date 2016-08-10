'use strict';

describe('Heatman Level', function() {
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
    before(function(done) {
      Promise.all([
        env.load('Heatman'),
      ]).then(([scene]) => {
        env.scene(scene);
        done();
      });
    });

    after(function() {
      env.game.unsetScene();
    });

    it('camera placed correctly', function() {
      expect(env.game.scene.camera.position)
        .to.eql({x: 180, y: -120, z: 150});
    });

    it('should hide player off screen on start', function() {
      expect(env.game.player.character.position)
        .to.eql({ x: 136, y: 35, z: 0});
    });

    it('should blink ready text', function(done) {
      this.text = env.game.scene.assets['start-caption'];
      env.waitTime(3/60).then(() => {
        expect(env.game.scene.world.scene.children)
          .to.contain(this.text);
        expect(this.text.visible).to.be(true);
        return env.waitTime(9/60);
      }).then(() => {
        expect(this.text.visible).to.be(false);
        return env.waitTime(9/60);
      }).then(() => {
        expect(this.text.visible).to.be(true);
        done();
      });
    });

    it('should remove ready text', function(done) {
      env.waitTime(100/60).then(() => {
        expect(env.game.scene.world.scene.children)
          .to.not.contain(this.text);
        delete this.text;
        done();
      });
    });

    it('should have teleported player to first checkpoint', function(done) {
      env.goToTick(310).then(() => {
        console.log(env.game.player.character);
        expect(env.game.player.character.position)
          .to.eql({x: 136, y: -165, z: 0});
        done();
      });
    });

    it.skip('disappearing blocks part 1 should be solvable', function() {
    });

    it.skip('disappearing blocks part 2 should be solvable', function() {
    });
  });
});
