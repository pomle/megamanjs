var expect = require('expect.js');
var sinon = require('sinon');

var env = require('../../importer.js');
var Engine = env.Engine;
var World = env.Engine.World;

describe('Engine', function() {
  var rendererMock;
  var worldMock;

  beforeEach(function() {
    rendererMock = {
      render: sinon.spy(),
    };

    worldMock = {
      scene: {},
      updateTime: sinon.spy(),
      camera: {
        camera: {},
        updateTime: sinon.spy(),
      },
    };

    var frameId = 0;
    global.requestAnimationFrame = sinon.spy(function() {
      return frameId++;
    });
    global.cancelAnimationFrame = sinon.spy();
  });

  afterEach(function() {
    delete global.requestAnimationFrame;
    delete global.cancelAnimationFrame;
  });

  describe('#constructor', function() {
    it('should initialize in paused mode', function() {
      var engine = new Engine();
      expect(engine.isRunning).to.be(false);
      expect(engine.frameId).to.be(undefined);
    });
  });
  describe('#eventLoop', function() {
    it('should propagate deltaTime of passed total time to #updateTime in seconds', function() {
      var engine = new Engine();
      engine.updateTime = sinon.spy();
      engine.render = sinon.spy();
      engine.isRunning = true;
      engine.eventLoop(0);
      engine.eventLoop(312);
      engine.eventLoop(312);
      engine.eventLoop(1253);
      expect(engine.updateTime.callCount).to.equal(3);
      expect(engine.updateTime.getCall(0).args[0]).to.equal(0.312);
      expect(engine.updateTime.getCall(1).args[0]).to.equal(0);
      expect(engine.updateTime.getCall(2).args[0]).to.equal(0.9409999999999998);
    });
    it('should bind itself to requestAnimationFrame if in running state', function() {
      var engine = new Engine();
      engine.render = sinon.spy();
      engine.isRunning = true;
      engine.eventLoop(0);
      expect(requestAnimationFrame.called).to.be(true);
      expect(requestAnimationFrame.lastCall.args[0]).to.be(engine.eventLoop);
    });
    it('should not affect time if no time given', function() {
      var engine = new Engine();
      engine.updateTime = sinon.spy();
      engine.render = sinon.spy();
      engine.isRunning = true;
      engine.eventLoop();
      expect(engine.updateTime.callCount).to.equal(0);
      expect(engine.render.callCount).to.equal(1);
      expect(engine.timeLastEvent).to.be(undefined);
    });
    it('should not bind itself to requestAnimationFrame if in paused state', function() {
      var engine = new Engine();
      engine.render = sinon.spy();
      engine.isRunning = false;
      engine.eventLoop(0);
      expect(requestAnimationFrame.called).to.be(false);
    });
    it('should feed fixed time to simulation regardless of time passed', function() {
      var engine = new Engine(rendererMock);
      engine.render = sinon.spy();
      engine.simulateTime = sinon.spy();
      engine.eventLoop(0);
      var timeMs = 0;
      while (timeMs < 1000) {
        timeMs += 100 * Math.random();
        engine.eventLoop(Math.min(1000, timeMs));
      }
      expect(engine.simulateTime.callCount).to.be(120);
      for (var i = 0, l = engine.simulateTime.callCount; i !== l; ++i) {
        expect(engine.simulateTime.getCall(i).args[0]).to.equal(engine.timeStep);
      }
    });
    it('should trigger EVENT_RENDER', function() {
      var engine = new Engine();
      engine.render = sinon.spy();
      var callback = sinon.spy();
      engine.events.bind(engine.EVENT_RENDER, callback);
      engine.eventLoop();
      expect(callback.callCount).to.equal(1);
    });
  });
  describe('#render', function() {
    it('should pass current world and camera into renderer', function() {
      var engine = new Engine(rendererMock);
      engine.world = worldMock;
      engine.render();
      expect(engine.renderer.render.callCount).to.equal(1);
      expect(engine.renderer.render.lastCall.args[0])
        .to.be(worldMock.scene);
      expect(engine.renderer.render.lastCall.args[1])
        .to.be(worldMock.camera.camera);
    });
  });
  describe('#pause', function() {
    it('should cancel current frame', function() {
      var engine = new Engine();
      engine.render = sinon.spy();
      engine.run();
      engine.pause();
      expect(cancelAnimationFrame.calledOnce).to.be(true);
      expect(cancelAnimationFrame.lastCall.args[0]).to.equal(engine.frameId);
    });
    it('should prevent requestAnimationFrame from being called in current loop', function() {
      var engine = new Engine();
      engine.render = sinon.spy();
      engine.run();
      expect(requestAnimationFrame.calledOnce).to.be(true);
      engine.pause();
      engine.eventLoop(0);
      expect(requestAnimationFrame.calledOnce).to.be(true);
    });
  });
  describe('#run', function() {
    it('should except if already running', function() {
      var engine = new Engine();
      engine.render = sinon.spy();
      engine.run();
      expect(function() { engine.run(); })
        .to.throwError(function(error) {
          expect(error).to.be.an(Error);
          expect(error.message).to.equal('Already running');
        });
    });
    it('should start running loop indefinitely', function() {
      var engine = new Engine(rendererMock);
      engine.render = sinon.spy();
      engine.run();
      expect(engine.isRunning).to.be(true);
      expect(requestAnimationFrame.calledOnce).to.be(true);
      expect(engine.frameId).to.equal(0);
    });
  });
  describe('#setWorld', function() {
    it('should set world property', function() {
      var engine = new Engine();
      var world = new World();
      engine.setWorld(world);
      expect(engine.world).to.be(world);
    });
    it('should except if not instance of world', function() {
      var engine = new Engine();
      expect(function() {
        engine.setWorld(1);
      }).to.throwError(function(error) {
        expect(error).to.be.a(TypeError);
        expect(error.message).to.equal('Invalid world');
      });
    });
  });
  describe('#unsetWorld', function() {
    it('should set world property to undefined', function() {
      var engine = new Engine();
      var world = new World();
      engine.setWorld(world);
      expect(engine.world).to.be(world);
      engine.unsetWorld();
      expect(engine.world).to.be(undefined);
    });
    it('should except if not instance of world', function() {
      var engine = new Engine();
      expect(function() {
        engine.setWorld(1);
      }).to.throwError(function(error) {
        expect(error).to.be.a(TypeError);
        expect(error.message).to.equal('Invalid world');
      });
    });
  });
  describe('#simulateTime', function() {
    it('should trigger EVENT_SIMULATE', function() {
      var engine = new Engine();
      engine.render = sinon.spy();
      engine.world = worldMock;
      var callback = sinon.spy();
      engine.events.bind(engine.EVENT_SIMULATE, callback);
      engine.simulateTime(.3);
      expect(callback.callCount).to.equal(1);
      expect(callback.lastCall.args[0]).to.equal(.3);
    });
  });
  describe('#updateTime', function() {
    it('should trigger EVENT_TIMEPASS', function() {
      var engine = new Engine();
      engine.render = sinon.spy();
      engine.simulateTime = sinon.spy();
      var callback = sinon.spy();
      engine.events.bind(engine.EVENT_TIMEPASS, callback);
      engine.updateTime(.3);
      expect(callback.callCount).to.equal(1);
      expect(callback.lastCall.args[0]).to.equal(.3);
    });
    it('should consume all accumulated time', function() {
      var engine = new Engine();
      engine.simulateTime = sinon.spy();
      engine.accumulator = engine.timeStep * 2.1;
      engine.updateTime(engine.timeStep);
      expect(engine.simulateTime.callCount).to.equal(3);
      expect(engine.accumulator).to.equal(0.0008333333333333352);
    });
    it('should increment realTimePassed', function() {
      var engine = new Engine();
      engine.simulateTime = sinon.spy();
      engine.updateTime(.0312);
      engine.updateTime(.0421);
      engine.updateTime(.2412);
      expect(engine.realTimePassed).to.equal(0.3145);
    });
    it('should pass multiplied time to simulateTime', function() {
      var engine = new Engine();
      engine.world = worldMock;
      engine.simulationSpeed = 1.3;
      engine.updateTime(.59);
      expect(engine.simulationTimePassed).to.equal(0.7666666666666664);
    });
    it('should not simulate if isSimulating flag untrue', function() {
      var engine = new Engine();
      engine.simulateTime = sinon.spy();
      engine.isSimulating = false;
      engine.simulationSpeed = 1;
      engine.updateTime(1);
      expect(engine.simulateTime.callCount).to.equal(0);
    });
    it('should not simulate if simulationSpeed is zero', function() {
      var engine = new Engine();
      engine.simulateTime = sinon.spy();
      engine.isSimulating = true;
      engine.simulationSpeed = 0;
      engine.updateTime(1);
      expect(engine.simulateTime.callCount).to.equal(0);
    });
  });
});
