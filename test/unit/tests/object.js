'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env.js');

const extend = env.Engine.Util.extend;
const Host = env.Engine.Object;
const Trait = env.Engine.Trait;

describe('Object', function() {
  const MockTrait = function() {
    Trait.apply(this, arguments);
  }
  extend(MockTrait, Trait);
  MockTrait.prototype.NAME = 'mockTrait';

  it('should have direction default to right', function() {
    const object = new Host;
    expect(object.direction).to.eql({x: 1, y: 0});
  });

  describe('#applyTrait', function() {
    it('should exposed trait name on host', function() {
      const host = new Host();
      const trait = new MockTrait();
      host.applyTrait(trait);
      expect(host.mockTrait).to.be(trait);
    });
    it('should except if trait name occupied', function() {
      const host = new Host();
      const trait = new MockTrait();
      host.applyTrait(trait);
      expect(function() {
        host.applyTrait(trait);
      }).to.throwError(function(error) {
        expect(error).to.be.an(Error);
        expect(error.message).to.equal('Trait name "mockTrait" occupied');
      });
    });
  });
  describe('#doFor()', function() {
    it('should run callback until time duration reached', function() {
      const host = new Host;
      const callbackSpy = sinon.spy();
      host.doFor(1, callbackSpy);
      host.timeShift(1);
      expect(callbackSpy.callCount).to.be(1);
      host.timeShift(1);
      expect(callbackSpy.callCount).to.be(1);
    });
    it('should return a promise that resolves when done', function(done) {
      const host = new Host;
      const callbackSpy = sinon.spy();
      host.doFor(2, callbackSpy).then(done);
      host.timeShift(2.1);
    });
  });
  describe('#waitFor()', function() {
    it('should return a promise that resolves when duration elapsed', function(done) {
      const host = new Host;
      const callbackSpy = sinon.spy();
      host.waitFor(2).then(done);
      host.timeShift(2);
    });
  });
  describe('#timeShift()', function() {
    it('should multiply time with object time multiplier', function() {
      const host = new Host;
      const callbackSpy = sinon.spy();
      host.events.bind(host.EVENT_TIMESHIFT, callbackSpy);
      host.timeStretch = 1.3;
      host.timeShift(1.7);
      expect(callbackSpy.lastCall.args).to.eql([2.21, 0]);
      host.timeShift(1.29);
      expect(callbackSpy.lastCall.args).to.eql([1.677, 2.21]);
    });
  });
});
