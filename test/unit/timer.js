const expect = require('expect.js');
const sinon = require('sinon');

const RequestAnimationFrameMock = require('../mocks/requestanimationframe-mock');
const Timer = require('../../src/engine/Timer');

describe('Timer', function() {
  function setup() {
    RequestAnimationFrameMock.mock();
  }

  function teardown() {
    RequestAnimationFrameMock.clean();
  }

  function createTimer() {
    const timer = new Timer;
    return timer;
  }

  describe('#constructor', function() {
    it('should initialize in paused mode', function() {
      setup();
      const timer = createTimer();
      RequestAnimationFrameMock.triggerAnimationFrame(1000);
      expect(requestAnimationFrame.called).to.be(false);
      teardown();
    });
  });

  describe('#eventLoop', function() {
    it('should bind itself to requestAnimationFrame if in running state', function() {
      setup();
      const timer = createTimer();
      timer.run();
      expect(requestAnimationFrame.callCount).to.be(1);
      expect(requestAnimationFrame.lastCall.args[0]).to.be(timer.eventLoop);
      RequestAnimationFrameMock.triggerAnimationFrame(0);
      expect(requestAnimationFrame.callCount).to.be(2);
      expect(requestAnimationFrame.lastCall.args[0]).to.be(timer.eventLoop);
      teardown();
    });

    it('should not bind itself to requestAnimationFrame if in paused state', function() {
      setup();
      const timer = createTimer();
      timer.run();
      timer.pause();
      RequestAnimationFrameMock.triggerAnimationFrame(100);
      expect(requestAnimationFrame.callCount).to.be(1);
      teardown();
    });

    it('should propagate delta time of requestAnimationFrame in seconds', function() {
      setup();
      const timer = createTimer();
      const updateSpy = sinon.spy();
      timer.events.bind(timer.EVENT_UPDATE, updateSpy);
      timer.run();
      RequestAnimationFrameMock.triggerAnimationFrame(200);
      expect(updateSpy.callCount).to.equal(1);
      expect(updateSpy.getCall(0).args[0]).to.equal(0.200);
      RequestAnimationFrameMock.triggerAnimationFrame(550);
      expect(updateSpy.callCount).to.equal(2);
      expect(updateSpy.getCall(1).args[0]).to.equal(0.350);
      teardown();
    });

    it('should not affect time if no time given', function() {
      setup();
      const timer = createTimer();
      const renderSpy = sinon.spy();
      const updateSpy = sinon.spy();
      timer.events.bind(timer.EVENT_RENDER, renderSpy);
      timer.events.bind(timer.EVENT_UPDATE, updateSpy);
      timer.isRunning = true;
      timer.eventLoop();
      expect(updateSpy.callCount).to.equal(0);
      expect(renderSpy.callCount).to.equal(1);
      expect(timer._timeLastEvent).to.be(null);
      teardown();
    });

  });

  describe('#pause', function() {
    it('should cancel current frame', function() {
      setup();
      const timer = createTimer();
      timer.run();
      timer.pause();
      expect(cancelAnimationFrame.calledOnce).to.be(true);
      expect(cancelAnimationFrame.lastCall.args[0]).to.be(timer._frameId);
      teardown();
    });

    it('should prevent requestAnimationFrame from being called in current loop', function() {
      setup();
      const timer = createTimer();
      timer.run();
      expect(requestAnimationFrame.calledOnce).to.be(true);
      timer.pause();
      timer.eventLoop(0);
      expect(requestAnimationFrame.calledOnce).to.be(true);
      teardown();
    });
  });

  describe('#run', function() {
    it('should not request animation frame if already running', function() {
      setup();
      const timer = createTimer();
      timer.run();
      expect(requestAnimationFrame.calledOnce).to.be(true);
      timer.run();
      expect(requestAnimationFrame.calledOnce).to.be(true);
      teardown();
    });

    it('should start running loop indefinitely', function() {
      setup();
      const timer = createTimer();
      timer.run();
      expect(timer._isRunning).to.be(true);
      expect(requestAnimationFrame.calledOnce).to.be(true);
      expect(timer._frameId).to.equal(0);
      teardown();
    });
  });

  describe('#setTimeStretch', function() {
    it('should alter delta time supplied in EVENT_UPDATE', function() {
      setup();
      const timer = createTimer();
      const callback = sinon.spy();
      timer.events.bind(timer.EVENT_UPDATE, callback);
      timer.setTimeStretch(2.13);
      timer.updateTime(0.3);
      expect(callback.callCount).to.equal(1);
      expect(callback.lastCall.args[0]).to.be.within(0.6389, 0.6399);
      teardown();
    });
  });

  describe('#updateTime', function() {
    it('should trigger EVENT_UPDATE with time in seconds', function() {
      setup();
      const timer = createTimer();
      const callback = sinon.spy();
      timer.events.bind(timer.EVENT_UPDATE, callback);
      timer.updateTime(1.234);
      expect(callback.callCount).to.equal(1);
      expect(callback.lastCall.args[0]).to.equal(1.234);
      teardown();
    });
  });
});
