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
      expect(timer._isRunning).to.be(false);
      expect(timer._frameId).to.be(null);
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
      timer._isRunning = true;
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
  });

  describe('#pause', function() {
    it('should cancel current frame', function() {
      timer.run();
      timer.pause();
      expect(cancelAnimationFrame.calledOnce).to.be(true);
      expect(cancelAnimationFrame.lastCall.args[0]).to.be(timer._frameId);
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
      expect(timer._isRunning).to.be(true);
      expect(requestAnimationFrame.calledOnce).to.be(true);
      expect(timer._frameId).to.equal(0);
    });
  });

  describe('#setTimeStretch', function() {
    it('should alter delta time supplied in EVENT_UPDATE', function() {
      const callback = sinon.spy();
      timer.events.bind(timer.EVENT_UPDATE, callback);
      timer.setTimeStretch(2.13);
      timer.updateTime(.3);
      expect(callback.callCount).to.equal(1);
      expect(callback.lastCall.args[0]).to.be(0.6389999999999999);
    });
  });

  describe('#updateTime', function() {
    it('should trigger EVENT_UPDATE', function() {
      const callback = sinon.spy();
      timer.events.bind(timer.EVENT_UPDATE, callback);
      timer.updateTime(.3);
      expect(callback.callCount).to.equal(1);
      expect(callback.lastCall.args[0]).to.equal(.3);
    });
  });
});
