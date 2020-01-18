const expect = require('expect.js');
const sinon = require('sinon');

const Mocks = require('@snakesilk/testing/mocks');

const {Game, Entity, Scene, Trait} = require('@snakesilk/engine');
const {Health} = require('@snakesilk/platform-traits');
const {Teleport} = require('@snakesilk/megaman-traits');

const Level = require('../Level');

describe('Level', function() {
  let level, scene;

  beforeEach(() => {
      Mocks.AudioContext.mock();
      Mocks.THREE.WebGLRenderer.mock();
      Mocks.requestAnimationFrame.mock();

      scene = new Scene();
      level = new Level(scene);
      const game = new Game();
      const character = new Entity;
      character.applyTrait(new Health());
      character.applyTrait(new Teleport());
      game.player.setCharacter(character);
      scene.events.trigger(scene.EVENT_CREATE, [game]);
  });

  afterEach(() => {
      Mocks.AudioContext.restore();
      Mocks.THREE.WebGLRenderer.restore();
      Mocks.requestAnimationFrame.restore();
  });

  it('should decrease player lives if player dies', function() {
    level.scene.world.addObject(level.player.character);
    level.player.lives = 3;
    level.player.character.health.kill();
    expect(level.player.lives).to.equal(2);
  });

  it('should run resetPlayer 4 seconds after death if lives > 1', function(done) {
    sinon.stub(level, 'resetPlayer').callsFake(function() {
      try {
        expect(scene.world._timeTotal).to.be.within(4, 4.01);
        done();
      } catch (e) {
        done(e);
      }
    });
    scene.world.addObject(level.player.character);
    level.player.lives = 2;
    level.player.character.health.kill();
    scene.world.updateTime(5);
  });

  it('should emit end event 4 seconds after death if lives <= 1', function(done) {
    const endEventSpy = sinon.spy(function() {
      try {
        expect(scene.world._timeTotal).to.be.within(4, 4.01);
        done();
      } catch (e) {
        done(e);
      }
    });
    scene.events.bind(scene.EVENT_END, endEventSpy);
    scene.world.addObject(level.player.character);
    level.player.lives = 1;
    level.player.character.health.kill();
    scene.world.updateTime(5);
  });

  describe('#resetObjects', function() {
    it('runs reset function on every trait of every object if available', function() {
      const entity = new Entity();
      const trait1 = new Trait();
      trait1.NAMW = 'foo';
      trait1.reset = sinon.spy();
      const trait2 = new Trait();
      trait2.NAME = 'bar';
      entity.applyTrait(trait1);
      entity.applyTrait(trait2);

      scene.world.addObject(entity);
      level.resetObjects();
      expect(trait1.reset.callCount).to.be(1);
    });
  });

  describe('#resetPlayer()', function() {
    beforeEach(() => {
      sinon.stub(level, 'readyBlink').returns(Promise.resolve());
    });

    it('calls readyBlink', () => {
      level.addCheckPoint(135, 345, 0);
      level.resetPlayer();
      expect(level.readyBlink.callCount).to.be(1);
    });

    it('should run reset on player', function() {
      const character = new Entity;
      character.reset = sinon.spy();
      level.player = { character };
      level.resetPlayer();
      expect(character.reset.callCount).to.be(1);
    });

    it('should put player on last checkpoint + offset', function() {
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
      level.checkPointOffset.set(0, 200);
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
        scene.world.updateTime(1);
      }, 0);
    });
  });
});
