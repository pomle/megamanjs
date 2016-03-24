var expect = require('expect.js');
var sinon = require('sinon');

var env = require('../../importer.js');
var Keyboard = env.Engine.Keyboard;

describe('Keyboard', function() {
  describe('#assign', function() {
    it('should allow multiple keys to be assigned to same event', function() {
      var input = new Keyboard();
      input.assign(1, input.LEFT);
      input.assign(2, input.LEFT);
      var spy = sinon.spy();
      input.hit(input.LEFT, spy);
      input.triggerEvent({keyCode: 1, type: 'keydown'});
      input.triggerEvent({keyCode: 1, type: 'keyup'});
      expect(spy.callCount).to.equal(1);
      input.triggerEvent({keyCode: 2, type: 'keydown'});
      expect(spy.callCount).to.equal(2);
    });
  });
  describe('#unassign', function() {
    it('should delete key mappings', function() {
      var input = new Keyboard();
      input.assign(1, input.LEFT);
      input.assign(2, input.LEFT);
      var spy = sinon.spy();
      input.hit(input.LEFT, spy);
      input.unassign(2);
      input.triggerEvent({keyCode: 2, type: 'keydown'});
      expect(spy.callCount).to.equal(0);
    });
  });
  describe('#intermittent', function() {
    it('should trigger engage callback on keydown event', function() {
      var input = new Keyboard();
      var code = 1;
      input.assign(code, input.LEFT);
      var engage = sinon.spy();
      var release = sinon.spy();
      input.intermittent(input.LEFT, engage, release);
      input.triggerEvent({keyCode: code, type: 'keydown'});
      expect(engage.callCount).to.equal(1);
      expect(release.callCount).to.equal(0);
    });
    it('should trigger release callback on keyup event', function() {
      var input = new Keyboard();
      var code = 1;
      input.assign(code, input.LEFT);
      var engage = sinon.spy();
      var release = sinon.spy();
      input.intermittent(input.LEFT, engage, release);
      input.triggerEvent({keyCode: code, type: 'keyup'});
      expect(engage.callCount).to.equal(0);
      expect(release.callCount).to.equal(1);
    });
    it('should prevent callbacks from being double called', function() {
      var input = new Keyboard();
      var code = 1;
      input.assign(code, input.LEFT);
      var engage = sinon.spy();
      var release = sinon.spy();
      input.intermittent(input.LEFT, engage, release);
      input.triggerEvent({keyCode: code, type: 'keydown'});
      expect(engage.callCount).to.equal(1);
      input.triggerEvent({keyCode: code, type: 'keydown'});
      expect(engage.callCount).to.equal(1);
      input.triggerEvent({keyCode: code, type: 'keyup'});
      expect(engage.callCount).to.equal(1);
      expect(release.callCount).to.equal(1);
      input.triggerEvent({keyCode: code, type: 'keydown'});
      expect(engage.callCount).to.equal(2);
      expect(release.callCount).to.equal(1);
    });
  });
  describe('#release', function() {
    it('should trigger release event on all keys', function() {
      var input = new Keyboard();

      var spies = {};

      for (var code in input.map) {
        var name = input.map[code];
        spies[name] = {
          on: sinon.spy(),
          off: sinon.spy(),
        };
        input.intermittent(name, spies[name].on, spies[name].off);
        input.trigger(name, input.ENGAGE);
      }

      for (var code in input.map) {
        var name = input.map[code];
        expect(spies[name].on.callCount).to.equal(1);
      }

      input.release();

      for (var code in input.map) {
        var name = input.map[code];
        expect(spies[name].on.callCount).to.equal(1);
        expect(spies[name].off.callCount).to.equal(1);
      }
    });
  });
  describe('#triggerEvent', function() {
    context('when matching bound key', function() {
      it('should call preventDefault() on event', function() {
        var input = new Keyboard();
        input.assign(2, input.LEFT);
        input.trigger = sinon.spy();
        var mockEvent = {
          keyCode: 2,
          preventDefault: sinon.spy(),
          type: 'keydown',
        };
        input.triggerEvent(mockEvent);
        expect(mockEvent.preventDefault.callCount).to.equal(1);
        expect(mockEvent.preventDefault.lastCall.args).to.have.length(0);
      });
    });
    context('when not matching bound key', function() {
      it('should not call preventDefault on event', function() {
        var input = new Keyboard();
        input.trigger = sinon.spy();
        var mockEvent = {
          keyCode: 2,
          preventDefault: sinon.spy(),
          type: 'keydown',
        };
        input.triggerEvent(mockEvent);
        expect(mockEvent.preventDefault.callCount).to.equal(0);
      });
    });
  });
});
