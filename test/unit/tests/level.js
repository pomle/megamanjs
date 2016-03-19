var expect = require('expect.js');
var sinon = require('sinon');

var env = require('../../importer.js');
var Engine = env.Engine;
var World = env.Engine.World;
var Game = env.Game;
var Level = env.Game.scenes.Level;

describe('Level', function() {
  var level;
  beforeEach(function() {
      var world = new World();
      var game = new Game();
      game.engine = new Engine();
      game.engine.render = sinon.spy();
      game.engine.world = world;
      level = new Level(game, world);
      level.game.player = new Game.Player();
      level.game.player.character = new Game.objects.Character();
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
});
