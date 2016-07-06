'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env.js');
const Scene = env.Game.Scene;

describe('Scene', function() {
  let scene;

  beforeEach(function() {
    scene = new Scene;

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

  describe('#doFor()', function() {
    it('should call callback for every simulation step for entire duration and supply elapsed time and progress fraction', function() {
      const callbackSpy = sinon.spy();
      scene.doFor(2, callbackSpy);
      scene.world.updateTime(1);
      expect(callbackSpy.callCount).to.be(120);
      expect(callbackSpy.getCall(0).args).to.eql([scene.world._timeStep, 0.004166666666666667]);
      expect(callbackSpy.getCall(12).args[0]).to.be(0.10833333333333332);
      scene.world.updateTime(2);
      expect(callbackSpy.lastCall.args).to.eql([2.008333333333329, 1]);
    });

    it('should return a promise that resolves when done', function(done) {
      const callbackSpy = sinon.spy();
      scene.doFor(2, callbackSpy).then(done);
      scene.world.updateTime(2.1);
    });
  });

  describe('#waitFor()', function() {
    it('should return a promise that resolves when duration elapsed', function(done) {
      const callbackSpy = sinon.spy();
      scene.waitFor(2).then(done);
      scene.world.updateTime(2);
    });
  });
});
