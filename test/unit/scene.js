const expect = require('expect.js');
const sinon = require('sinon');

const RequestAnimationFrameMock = require('../mocks/requestanimationframe-mock');
const Scene = require('../../src/engine/Scene');

describe('Scene', function() {
  function createScene() {
    RequestAnimationFrameMock.mock();
    const scene = new Scene;
    RequestAnimationFrameMock.clean();
    return scene;
  }

  describe('#startSimulation()', function() {
    it('should bind to timer update event', function() {
      const scene = createScene();
      scene.startSimulation();
      const timer = scene.timer;
      expect(timer.events.bound(timer.EVENT_UPDATE, scene._timerUpdate)).to.be(true);
    });
  });

  describe('#stopSimulation()', function() {
    it('should unbind from timer update event', function() {
      const scene = createScene();
      scene.startSimulation();
      scene.stopSimulation();
      const timer = scene.timer;
      expect(timer.events.bound(timer.EVENT_UPDATE, scene._timerUpdate)).to.be(false);
    });
  });

  describe('#doFor()', function() {
    it('should call callback for every simulation step for entire duration and supply elapsed time and progress fraction', function() {
      const scene = createScene();
      const callbackSpy = sinon.spy();
      scene.doFor(2, callbackSpy);
      scene.world.updateTime(1);
      expect(callbackSpy.callCount).to.be(120);
      expect(callbackSpy.getCall(0).args).to.eql([scene.world.timeStep, 0.004166666666666667]);
      expect(callbackSpy.getCall(12).args[0]).to.be(0.10833333333333332);
      scene.world.updateTime(2);
      expect(callbackSpy.lastCall.args).to.eql([2.008333333333329, 1]);
    });

    it('should return a promise that resolves when done', function(done) {
      const scene = createScene();
      const callbackSpy = sinon.spy();
      scene.doFor(2, callbackSpy).then(time => {
        done();
      });
      scene.world.updateTime(2.1);
    });
  });

  describe('#waitFor()', function() {
    it('should return a promise that resolves when duration elapsed', function(done) {
      const scene = createScene();
      const callbackSpy = sinon.spy();
      scene.waitFor(2).then(time => {
        expect(time.elapsed).to.be(2.008333333333329);
        done();
      });
      scene.world.updateTime(3);
    });
  });
});
