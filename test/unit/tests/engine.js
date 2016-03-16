var expect = require('expect.js');
var sinon = require('sinon');

var Engine = require('../../importer.js').Engine;

describe('Engine', function() {
  var rendererMock = {
    render: sinon.spy(),
  };

  beforeEach(function() {
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

  describe('#loop', function() {
    it('should bind itself to requestAnimationFrame if in running state', function() {
      var engine = new Engine();
      engine.isRunning = true;
      engine.loop(0);
      expect(requestAnimationFrame.called).to.be(true);
      expect(requestAnimationFrame.lastCall.args[0]).to.be(engine.loop);
    });
    it('should not bind itself to requestAnimationFrame if in paused state', function() {
      var engine = new Engine();
      engine.isRunning = false;
      engine.loop(0);
      expect(requestAnimationFrame.called).to.be(false);
    });
    it('should feed time diff between loops in seconds to world', function() {
      var engine = new Engine(rendererMock);
      engine.world = {
        updateTime: sinon.spy(),
        camera: {
          updateTime: sinon.spy(),
        },
      }
      engine.loop(100);
      engine.loop(113);
      expect(engine.world.updateTime.calledOnce).to.be(true);
      expect(engine.world.camera.updateTime.calledOnce).to.be(true);
      expect(engine.world.updateTime.lastCall.args[0]).to.eql(0.012999999999999998);

    });
  });

  describe('#pause', function() {
    it('should cancel current frame', function() {
      var engine = new Engine();
      engine.run();
      engine.pause();
      expect(cancelAnimationFrame.calledOnce).to.be(true);
      expect(cancelAnimationFrame.lastCall.args[0]).to.equal(engine.frameId);
    });
    it('should prevent requestAnimationFrame from being called in current loop', function() {
      var engine = new Engine();
      engine.run();
      expect(requestAnimationFrame.calledOnce).to.be(true);
      engine.pause();
      engine.loop(0);
      expect(requestAnimationFrame.calledOnce).to.be(true);
    });
  });

  describe('#run', function() {
    it('should except if already running', function() {
      var engine = new Engine();
      engine.run();
      expect(function() { engine.run(); })
        .to.throwError(function(error) {
          expect(error).to.be.an(Error);
          expect(error.message).to.equal('Already running');
        });
    });
    it('should start running loop indefinitely', function() {
      var engine = new Engine(rendererMock);
      engine.run();
      expect(engine.isRunning).to.be(true);
      expect(requestAnimationFrame.calledOnce).to.be(true);
      expect(engine.frameId).to.equal(0);

    });
  });
});
