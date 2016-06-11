'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env.js');
const THREE = env.THREE;
const Game = env.Game;
const Level = env.Game.scenes.Level;

describe('Level', function() {
  function createLevel() {
      global.AudioContext = sinon.spy();
      sinon.stub(THREE, 'WebGLRenderer');
      const level = new Level();
      const game = new Game();
      const character = new Game.objects.Character;
      character.applyTrait(new Game.traits.Health);
      game.player.setCharacter(character);
      level.__create(game);
      THREE.WebGLRenderer.restore();
      delete global.AudioContext;
      return level;
  }

  it('should decrease player lives if player dies', function() {
    const level = createLevel();
    level.world.addObject(level.player.character);
    level.player.lives = 3;
    level.player.character.kill();
    expect(level.player.lives).to.equal(2);
  });

  it('should run resetPlayer 4 seconds after death if lives > 1', function(done) {
    const level = createLevel();
    sinon.stub(level, 'resetPlayer', function() {
      try {
        expect(level.timer.realTimePassed).to.be(4);
        done();
      } catch (e) {
        done(e);
      }
    });
    level.world.addObject(level.player.character);
    level.player.lives = 2;
    level.player.character.kill();
    level.timer.updateTime(3.999);
    level.timer.updateTime(0.001);
  });

  it('should run __end 4 seconds after death if lives <= 1', function() {
    const level = createLevel();
    sinon.stub(level, '__end', function() {
      try {
        expect(level.timer.realTimePassed).to.be(4);
        done();
      } catch (e) {
        done(e);
      }
    });
    level.world.addObject(level.player.character);
    level.player.lives = 1;
    level.player.character.kill();
    level.timer.updateTime(3.999);
    level.timer.updateTime(0.001);
  });

  describe('#resetObjects', function() {
    it('should run reset function on every trait of every object if available', function() {
      const level = new Level();
      const thing = new Engine.Object();
      const resetSpy = sinon.spy();
      thing.traits = [
        { reset: resetSpy },
        { dummy: null },
      ];
      level.world.addObject(thing);
      level.resetObjects();
      expect(resetSpy.callCount).to.be(1);
    });
  });
});
