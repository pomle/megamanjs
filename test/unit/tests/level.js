'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env.js');
const AudioContextMock = require('../../mocks/audiocontext-mock');
const WebGLRendererMock = require('../../mocks/webglrenderer-mock');
const RequestAnimationFrameMock = require('../../mocks/requestanimationframe-mock');
const Game = env.Game;
const Level = env.Game.scenes.Level;

describe('Level', function() {
  function createLevel() {
      AudioContextMock.mock();
      WebGLRendererMock.mock();
      RequestAnimationFrameMock.mock();
      const level = new Level();
      const game = new Game();
      const character = new Game.objects.Character;
      character.applyTrait(new Game.traits.Health);
      game.player.setCharacter(character);
      level.events.trigger(level.EVENT_CREATE, [game]);;
      AudioContextMock.clean();
      WebGLRendererMock.clean();
      RequestAnimationFrameMock.clean();
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
        expect(level.world._timeTotal).to.be(4);
        done();
      } catch (e) {
        done(e);
      }
    });
    level.world.addObject(level.player.character);
    level.player.lives = 2;
    level.player.character.kill();
    level.world.updateTime(3.999);
    level.world.updateTime(0.001);
  });

  it('should emit end event 4 seconds after death if lives <= 1', function() {
    const level = createLevel();
    const endEventSpy = sinon.spy(function() {
      try {
        expect(level.timer._timeTotal).to.be(4);
        done();
      } catch (e) {
        done(e);
      }
    });
    level.events.bind(level.EVENT_END, endEventSpy);
    level.world.addObject(level.player.character);
    level.player.lives = 1;
    level.player.character.kill();
    level.world.updateTime(3.999);
    level.world.updateTime(0.001);
  });

  describe('#resetObjects', function() {
    it('should run reset function on every trait of every object if available', function() {
      const level = createLevel();
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
