'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env.js');
const Engine = env.Engine;

describe('Events', function() {
  const events = new Engine.Events();
  const callback1 = sinon.spy();
  const callback2 = sinon.spy();
  const callback3 = sinon.spy();
  describe('#bind()', function() {
    it('should except if name not string', function() {
      expect(function() {
        events.bind(1);
      }).to.throwError(function(error) {
        expect(error).to.be.a(TypeError);
        expect(error.message).to.equal("Event name must be string");
      });
    });
    it('should accept a function as bindable', function() {
      events.bind('event1', callback1);
      events.bind('event1', callback2);
    });
    it('should accept same callback to be bound to different events', function() {
      events.bind('event2', callback2);
      events.bind('event2', callback3);
    });
  });
  describe('#bound()', function() {
    it('should return true if callback bound to event', function() {
      expect(events.bound('event1', callback1)).to.be(true);
    });
    it('should return false if callback not bound to event', function() {
      expect(events.bound('foo', callback1)).to.be(false);
    });
  });
  describe('#trigger()', function() {
    it('should call each callback once', function() {
      events.trigger('event1');
      expect(callback1.callCount).to.equal(1);
      expect(callback2.callCount).to.equal(1);
      expect(callback3.callCount).to.equal(0);
    });
    it('should propagate values to callback as args', function() {
      const values = ['a', 1, undefined];
      events.trigger('event1', values);
      expect(callback1.callCount).to.equal(2);
      expect(callback2.callCount).to.equal(2);
      expect(callback3.callCount).to.equal(0);
      expect(callback1.lastCall.args).to.eql(values);
      expect(callback2.lastCall.args).to.eql(values);
    });
  });
  describe('#unbind()', function() {
    it('should prevent a method from being called on event', function() {
      events.unbind('event1', callback1);
      events.trigger('event1');
      expect(callback1.callCount).to.equal(2);
      expect(callback2.callCount).to.equal(3);
    });
    it('should silently ignore unbinding of unbound events', function() {
      events.unbind('event1', callback1);
      events.unbind('not-defined-event-name', callback1);
    });
  });
});
