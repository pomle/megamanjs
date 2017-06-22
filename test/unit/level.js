const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../env');
const AudioContextMock = require('../mocks/audiocontext-mock');
const WebGLRendererMock = require('../mocks/webglrenderer-mock');
const RequestAnimationFrameMock = require('../mocks/requestanimationframe-mock');

const Game = require('../../src/engine/Game');
const Entity = require('../../src/engine/Object');
const Level = require('../../src/engine/scene/Level');
const Health = require('../../src/engine/traits/Health');
const Teleport = require('../../src/engine/traits/Teleport');

describe('Level', function() {
  beforeEach(() => {
      AudioContextMock.mock();
      WebGLRendererMock.mock();
      RequestAnimationFrameMock.mock();
  });

  afterEach(() => {
      AudioContextMock.clean();
      WebGLRendererMock.clean();
      RequestAnimationFrameMock.clean();
  });

  function createLevel() {
      const level = new Level();
      const game = new Game();
      const character = new Entity;
      character.applyTrait(new Health);
      character.applyTrait(new Teleport);
      console.log(character);
      game.player.setCharacter(character);
      level.events.trigger(level.EVENT_CREATE, [game]);;
      return level;
  }

  it('should decrease player lives if player dies', function() {
    const level = createLevel();
    level.world.addObject(level.player.character);
    level.player.lives = 3;
    level.player.character.health.kill();
    expect(level.player.lives).to.equal(2);
  });

  it('should run resetPlayer 4 seconds after death if lives > 1', function(done) {
    const level = createLevel();
    sinon.stub(level, 'resetPlayer', function() {
      try {
        expect(level.world._timeTotal).to.be.within(4, 4.01);
        done();
      } catch (e) {
        done(e);
      }
    });
    level.world.addObject(level.player.character);
    level.player.lives = 2;
    level.player.character.health.kill();
    level.world.updateTime(5);
  });

  it('should emit end event 4 seconds after death if lives <= 1', function(done) {
    const level = createLevel();
    const endEventSpy = sinon.spy(function() {
      try {
        expect(level.world._timeTotal).to.be.within(4, 4.01);
        done();
      } catch (e) {
        done(e);
      }
    });
    level.events.bind(level.EVENT_END, endEventSpy);
    level.world.addObject(level.player.character);
    level.player.lives = 1;
    level.player.character.health.kill();
    level.world.updateTime(5);
  });

  describe('#resetObjects', function() {
    it('should run reset function on every trait of every object if available', function() {
      const level = createLevel();
      const thing = new Entity();
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

  describe('#resetPlayer()', function() {
    it('should run reset on player', function() {
      const level = createLevel();
      const character = new Entity;
      character.reset = sinon.spy();
      level.player = { character };
      level.resetPlayer();
      expect(character.reset.calledOnce).to.be(true);
    });

    it('should put player on last checkpoint + offset', function() {
      const level = createLevel();
      level.checkPointOffset.set(0, 200);
      level.addCheckPoint(135, 345, 0);
      level.addCheckPoint(1243, 1211, 0);
      level.addCheckPoint(7465, 2345, 0);
      level.checkPointIndex = 0;
      level.resetPlayer();
      expect(level.player.character.position).to.eql({x: 135, y: 545, z: 0});
      level.checkPointIndex = 2;
      level.resetPlayer();
      expect(level.player.character.position).to.eql({x: 7465, y: 2545, z: 0});
      level.checkPointIndex = 1;
      level.resetPlayer();
      expect(level.player.character.position).to.eql({x: 1243, y: 1411, z: 0});
    });

    it('should activate a teleportation from checkpoint + offset', function(done) {
      const level = createLevel();
      level.checkPointOffset.set(0, 200);
      level.readyBlinkTime = 0;
      level.addCheckPoint(300, 100, 0);
      level.player.character.events.bind(level.player.character.teleport.EVENT_START, () => {
        try {
          expect(level.player.character.position).to.eql({x: 300, y: 300, z: 0 });
          done();
        } catch (e) {
          done(e);
        }
      });
      level.resetPlayer();
      level.world.updateTime(0);
    });

    it('should teleport to checkpoint', function(done) {
      const level = createLevel();
      level.checkPointOffset.set(0, 200);
      level.readyBlinkTime = 0;
      level.addCheckPoint(300, 100, 0);
      level.player.character.events.bind(level.player.character.teleport.EVENT_END, () => {
        try {
          expect(level.player.character.position).to.eql({x: 300, y: 100, z: 0 });
          done();
        } catch (e) {
          done(e);
        }
      });
      level.resetPlayer();

      setTimeout(function() {
        level.world.updateTime(1);
      }, 0);
    });
  });
});
