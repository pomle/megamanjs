'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env.js');
const Game = env.Game;
const Level = env.Game.scenes.Level;

describe('Level', function() {
  let level;
  beforeEach(function() {
      level = new Level();

      const character = new Game.objects.Character();
      character.applyTrait(new Game.traits.Health());
      level.player.character = character;
  });

  describe('#detectDeath', function() {
    it('should decrease player lives if player is dead and set deathCountdown', function() {
      expect(level.game.player.lives).to.equal(3);
      level.detectDeath();
      expect(level.game.player.lives).to.equal(3);
      level.game.player.character.health.amount = 0;
      level.detectDeath();
      expect(level.game.player.lives).to.equal(2);
      expect(level.deathCountdown).to.equal(4);
    });
    it('should run resetPlayer 4 seconds after death if lives > 0', function() {
      level.resetPlayer = sinon.spy();
      level.game.player.character.health.amount = 0;
      level.game.player.lives = 2;
      level.detectDeath();
      level.game.engine.updateTime(4);
      level.detectDeath();
      expect(level.resetPlayer.callCount).to.equal(1);
    });
    it('should run __end 4 seconds after death if lives <= 0', function() {
      level.resetPlayer = sinon.spy();
      level.__end = sinon.spy();
      level.game.player.character.health.amount = 0;
      level.game.player.lives = 1;
      level.detectDeath();
      level.game.engine.updateTime(4);
      level.detectDeath();
      expect(level.resetPlayer.callCount).to.equal(0);
      expect(level.__end.callCount).to.equal(1);
    });
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
