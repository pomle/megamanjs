const expect = require('expect.js');
const sinon = require('sinon');

const Events = require('../../src/engine/Events');

describe('Events', function() {
  it('should apply this value to thisable functions', function() {
    const host = sinon.spy();
    const events = new Events(host);
    const callback = sinon.spy();
    events.bind('event', callback);
    events.trigger('event');
    expect(callback.calledOn(host)).to.be(true);
  });

  describe('#bind()', function() {
    it('should except if name not string', function() {
      const events = new Events();
      expect(function() {
        events.bind(1);
      }).to.throwError(function(error) {
        expect(error).to.be.a(TypeError);
        expect(error.message).to.equal("Event name must be string");
      });
    });

    it('should accept a function as bindable', function() {
      const events = new Events();
      const callback = sinon.spy();
      events.bind('event', callback);
      events.trigger('event');
      expect(callback.callCount).to.be(1);
    });

    it('should accept same callback to be bound to different events', function() {
      const events = new Events();
      const callback = sinon.spy();
      events.bind('event1', callback);
      events.bind('event2', callback);
      events.trigger('event1');
      events.trigger('event2');
      expect(callback.callCount).to.be(2);
    });

    it('should only bind a callback once', function() {
      const events = new Events();
      const callback = sinon.spy();
      events.bind('event', callback);
      events.bind('event', callback);
      events.trigger('event');
      expect(callback.callCount).to.be(1);
    });
  });

  describe('#bound()', function() {
    it('should return true if callback bound to event', function() {
      const events = new Events();
      const callback = sinon.spy();
      events.bind('event', callback);
      expect(events.bound('event', callback)).to.be(true);
    });
    it('should return false if callback not bound to event', function() {
      const events = new Events();
      const callback = sinon.spy();
      events.bind('event_x', callback);
      expect(events.bound('event', callback)).to.be(false);
    });
  });

  describe('#clear()', function() {
    it('throws away all bound events', function() {
      const events = new Events();
      const callback = sinon.spy();
      events.bind('event', callback);
      events.clear();
      expect(events.bound(callback)).to.be(false);
    });
  });

  describe('#once()', function() {
    it('trigger bound events once then unbinds', function() {
      const events = new Events();
      const callback = sinon.spy();
      events.once('event', callback);
      events.trigger('event');
      events.trigger('event');
      expect(callback.callCount).to.be(1);
      expect(events.bound(callback)).to.be(false);
    });
  });

  describe('#trigger()', function() {
    it('should call each callback once', function() {
      const events = new Events();
      const callback1 = sinon.spy();
      const callback2 = sinon.spy();
      const callback3 = sinon.spy();
      events.bind('event', callback1);
      events.bind('event', callback2);
      events.bind('event', callback3);
      events.trigger('event');
      expect(callback1.callCount).to.be(1);
      expect(callback2.callCount).to.be(1);
      expect(callback3.callCount).to.be(1);
    });

    it('should propagate values to callback as args', function() {
      const events = new Events();
      const callback = sinon.spy();
      const values = ['a', 1, undefined];
      events.bind('event', callback);
      events.trigger('event', values);
      expect(callback.lastCall.args).to.eql(values);
    });
  });

  describe('#unbind()', function() {
    it('should prevent a method from being called on event', function() {
      const events = new Events();
      const callback = sinon.spy();
      events.bind('event', callback);
      events.trigger('event');
      expect(callback.callCount).to.be(1);
      events.unbind('event', callback);
      events.trigger('event');
      expect(callback.callCount).to.be(1);
    });

    it('should silently ignore unbinding of unknown event names', function() {
      const events = new Events();
      const callback = sinon.spy();
      events.unbind('not-defined-event-name', callback);
    });

    it('should silently ignore unbinding of unbound events', function() {
      const events = new Events();
      const callback = sinon.spy();
      events.bind('known-defined-event-name', callback);
      events.unbind('known-defined-event-name', callback);
      events.unbind('known-defined-event-name', callback);
    });
  });
});
