'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env.js');
const Timer = env.Engine.Timer;

describe('Timer', function() {
  let timer;

  beforeEach(function() {
    timer = new Engine.Timer();

    let frameId = 0;
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
      expect(timer.isRunning).to.be(false);
      expect(timer.frameId).to.be(undefined);
    });
  });
  describe('#doFor()', function() {
    it('should call callback for every simulation step for entire duration and supply elapsed time and progress fraction', function() {
      const callbackSpy = sinon.spy();
      timer.doFor(2, callbackSpy);
      timer.updateTime(1);
      expect(callbackSpy.callCount).to.be(120);
      expect(callbackSpy.getCall(0).args).to.eql([timer.timeStep, 0.004166666666666667]);
      expect(callbackSpy.getCall(12).args[0]).to.be(0.10833333333333332);
      timer.updateTime(2);
      expect(callbackSpy.lastCall.args).to.eql([2.008333333333329, 1]);
    });
    it('should return a promise that resolves when done', function(done) {
      const callbackSpy = sinon.spy();
      timer.doFor(2, callbackSpy).then(done);
      timer.updateTime(2.1);
    });
  });
  describe('#eventLoop', function() {
    it('should propagate deltaTime of passed total time to #updateTime in seconds', function() {
      timer.updateTime = sinon.spy();
      timer.isRunning = true;
      timer.eventLoop(0);
      timer.eventLoop(312);
      timer.eventLoop(312);
      timer.eventLoop(1253);
      expect(timer.updateTime.callCount).to.equal(3);
      expect(timer.updateTime.getCall(0).args[0]).to.equal(0.312);
      expect(timer.updateTime.getCall(1).args[0]).to.equal(0);
      expect(timer.updateTime.getCall(2).args[0]).to.equal(0.9409999999999998);
    });
    it('should bind itself to requestAnimationFrame if in running state', function() {
      timer.render = sinon.spy();
      timer.isRunning = true;
      timer.eventLoop(0);
      expect(requestAnimationFrame.called).to.be(true);
      expect(requestAnimationFrame.lastCall.args[0]).to.be(timer.eventLoop);
    });
    it('should not affect time if no time given', function() {
      const renderSpy = sinon.spy();
      const updateSpy = sinon.spy();
      timer.events.bind(timer.EVENT_RENDER, renderSpy);
      timer.events.bind(timer.EVENT_UPDATE, updateSpy);
      timer.isRunning = true;
      timer.eventLoop();
      expect(updateSpy.callCount).to.equal(0);
      expect(renderSpy.callCount).to.equal(1);
      expect(timer.timeLastEvent).to.be(undefined);
    });
    it('should not bind itself to requestAnimationFrame if in paused state', function() {
      timer.isRunning = false;
      timer.eventLoop(0);
      expect(requestAnimationFrame.called).to.be(false);
    });
    it('should feed fixed time to simulation regardless of time passed', function() {
      const simulateSpy = sinon.spy();
      timer.events.bind(timer.EVENT_SIMULATE, simulateSpy);
      timer.eventLoop(0);
      let timeMs = 0;
      while (timeMs < 1000) {
        timeMs += 100 * Math.random();
        timer.eventLoop(Math.min(1000, timeMs));
      }
      expect(simulateSpy.callCount).to.be(120);
      for (let i = 0, l = simulateSpy.callCount; i !== l; ++i) {
        expect(simulateSpy.getCall(i).args[0]).to.equal(timer.timeStep);
      }
    });
  });
  describe('#pause', function() {
    it('should cancel current frame', function() {
      timer.run();
      timer.pause();
      expect(cancelAnimationFrame.calledOnce).to.be(true);
      expect(cancelAnimationFrame.lastCall.args[0]).to.equal(timer.frameId);
    });
    it('should prevent requestAnimationFrame from being called in current loop', function() {
      timer.render = sinon.spy();
      timer.run();
      expect(requestAnimationFrame.calledOnce).to.be(true);
      timer.pause();
      timer.eventLoop(0);
      expect(requestAnimationFrame.calledOnce).to.be(true);
    });
  });
  describe('#run', function() {
    it('should not request animation frame if already running', function() {
      timer.run();
      expect(requestAnimationFrame.calledOnce).to.be(true);
      timer.run();
      expect(requestAnimationFrame.calledOnce).to.be(true);
    });
    it('should start running loop indefinitely', function() {
      timer.render = sinon.spy();
      timer.run();
      expect(timer.isRunning).to.be(true);
      expect(requestAnimationFrame.calledOnce).to.be(true);
      expect(timer.frameId).to.equal(0);
    });
  });
  describe('#simulateTime', function() {
    it('should trigger EVENT_SIMULATE', function() {
      timer.render = sinon.spy();
      const callback = sinon.spy();
      timer.events.bind(timer.EVENT_SIMULATE, callback);
      timer.simulateTime(.3);
      expect(callback.callCount).to.equal(1);
      expect(callback.lastCall.args[0]).to.equal(.3);
    });
  });
  describe('#updateTime', function() {
    it('should trigger EVENT_TIMEPASS', function() {
      timer.render = sinon.spy();
      timer.simulateTime = sinon.spy();
      const callback = sinon.spy();
      timer.events.bind(timer.EVENT_TIMEPASS, callback);
      timer.updateTime(.3);
      expect(callback.callCount).to.equal(1);
      expect(callback.lastCall.args[0]).to.equal(.3);
    });
    it('should consume all accumulated time', function() {
      timer.simulateTime = sinon.spy();
      timer.accumulator = timer.timeStep * 2.1;
      timer.updateTime(timer.timeStep);
      expect(timer.simulateTime.callCount).to.equal(3);
      expect(timer.accumulator).to.equal(0.0008333333333333352);
    });
    it('should increment realTimePassed', function() {
      timer.simulateTime = sinon.spy();
      timer.updateTime(.0312);
      timer.updateTime(.0421);
      timer.updateTime(.2412);
      expect(timer.realTimePassed).to.equal(0.3145);
    });
    it('should pass multiplied time to simulateTime', function() {
      timer.simulationSpeed = 1.3;
      timer.updateTime(.59);
      expect(timer.simulationTimePassed).to.equal(0.7666666666666664);
    });
    it('should not simulate if isSimulating flag untrue', function() {
      timer.simulateTime = sinon.spy();
      timer.isSimulating = false;
      timer.simulationSpeed = 1;
      timer.updateTime(1);
      expect(timer.simulateTime.callCount).to.equal(0);
    });
    it('should not simulate if simulationSpeed is zero', function() {
      timer.simulateTime = sinon.spy();
      timer.isSimulating = true;
      timer.simulationSpeed = 0;
      timer.updateTime(1);
      expect(timer.simulateTime.callCount).to.equal(0);
    });
    it('should emit update event once regardless of simulation iterations', function() {
      const simulateSpy = sinon.spy();
      const updateSpy = sinon.spy();
      timer.events.bind(timer.EVENT_SIMULATE, simulateSpy);
      timer.events.bind(timer.EVENT_UPDATE, updateSpy);
      timer.updateTime(1);
      expect(simulateSpy.callCount).to.equal(120);
      expect(updateSpy.callCount).to.equal(1);
    });
  });
  describe('#waitFor()', function() {
    it('should return a promise that resolves when duration elapsed', function(done) {
      const callbackSpy = sinon.spy();
      timer.waitFor(2).then(done);
      timer.updateTime(2);
    });
  });
});
