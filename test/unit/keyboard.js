const expect = require('expect.js');
const sinon = require('sinon');

const Keyboard = require('../../src/engine/Keyboard');

describe('Keyboard', function() {
  describe('#assign()', function() {
    it('should allow multiple keys to be assigned to same event', function() {
      const input = new Keyboard();
      input.assign(1, input.LEFT);
      input.assign(2, input.LEFT);
      const spy = sinon.spy();
      input.hit(input.LEFT, spy);
      input.handleEvent({keyCode: 1, type: 'keydown'});
      input.handleEvent({keyCode: 1, type: 'keyup'});
      expect(spy.callCount).to.equal(1);
      input.handleEvent({keyCode: 2, type: 'keydown'});
      expect(spy.callCount).to.equal(2);
    });
  });

  describe('#unassign()', function() {
    it('should delete key mappings', function() {
      const input = new Keyboard();
      input.assign(1, input.LEFT);
      input.assign(2, input.LEFT);
      const spy = sinon.spy();
      input.hit(input.LEFT, spy);
      input.unassign(2);
      input.handleEvent({keyCode: 2, type: 'keydown'});
      expect(spy.callCount).to.equal(0);
    });

    it('should release assigned key', function() {
      const code = 1;
      const input = new Keyboard();
      input.assign(code, input.LEFT);
      const on = sinon.spy();
      const off = sinon.spy();
      input.intermittent(input.LEFT, on, off);
      input.handleEvent({keyCode: code, type: 'keydown'});
      expect(on.callCount).to.equal(1);
      expect(off.callCount).to.equal(0);
      input.unassign(code);
      expect(on.callCount).to.equal(1);
      expect(off.callCount).to.equal(1);
    });
  });

  describe('#intermittent()', function() {
    it('should trigger engage callback on keydown event', function() {
      const input = new Keyboard();
      const code = 1;
      input.assign(code, input.LEFT);
      const engage = sinon.spy();
      const release = sinon.spy();
      input.intermittent(input.LEFT, engage, release);
      input.handleEvent({keyCode: code, type: 'keydown'});
      expect(engage.callCount).to.equal(1);
      expect(release.callCount).to.equal(0);
    });

    it('should trigger release callback on keyup event', function() {
      const input = new Keyboard();
      const code = 1;
      input.assign(code, input.LEFT);
      const engage = sinon.spy();
      const release = sinon.spy();
      input.intermittent(input.LEFT, engage, release);
      input.handleEvent({keyCode: code, type: 'keyup'});
      expect(engage.callCount).to.equal(0);
      expect(release.callCount).to.equal(1);
    });

    it('should prevent callbacks from being double called', function() {
      const input = new Keyboard();
      const code = 1;
      input.assign(code, input.LEFT);
      const engage = sinon.spy();
      const release = sinon.spy();
      input.intermittent(input.LEFT, engage, release);
      input.handleEvent({keyCode: code, type: 'keydown'});
      expect(engage.callCount).to.equal(1);
      input.handleEvent({keyCode: code, type: 'keydown'});
      expect(engage.callCount).to.equal(1);
      input.handleEvent({keyCode: code, type: 'keyup'});
      expect(engage.callCount).to.equal(1);
      expect(release.callCount).to.equal(1);
      input.handleEvent({keyCode: code, type: 'keydown'});
      expect(engage.callCount).to.equal(2);
      expect(release.callCount).to.equal(1);
    });
  });

  describe('#release()', function() {
    it('should trigger release event on all keys', function() {
      const input = new Keyboard();

      const spies = {};

      for (let code in input.map) {
        const name = input.map[code];
        spies[name] = {
          on: sinon.spy(),
          off: sinon.spy(),
        };
        input.intermittent(name, spies[name].on, spies[name].off);
        input.trigger(name, input.ENGAGE);
      }

      for (let code in input.map) {
        const name = input.map[code];
        expect(spies[name].on.callCount).to.equal(1);
      }

      input.release();

      for (let code in input.map) {
        const name = input.map[code];
        expect(spies[name].on.callCount).to.equal(1);
        expect(spies[name].off.callCount).to.equal(1);
      }
    });
  });

  describe('#handleEvent()', function() {
    context('when matching bound key', function() {
      it('should call preventDefault() on event', function() {
        const input = new Keyboard();
        input.assign(2, input.LEFT);
        input.trigger = sinon.spy();
        const mockEvent = {
          keyCode: 2,
          preventDefault: sinon.spy(),
          type: 'keydown',
        };
        input.handleEvent(mockEvent);
        expect(mockEvent.preventDefault.callCount).to.equal(1);
        expect(mockEvent.preventDefault.lastCall.args).to.have.length(0);
      });
    });

    context('when not matching bound key', function() {
      it('should not call preventDefault on event', function() {
        const input = new Keyboard();
        input.trigger = sinon.spy();
        const mockEvent = {
          keyCode: 2,
          preventDefault: sinon.spy(),
          type: 'keydown',
        };
        input.handleEvent(mockEvent);
        expect(mockEvent.preventDefault.callCount).to.equal(0);
      });
    });
  });

  describe('#exportMap()', function() {
    it('should return current map as object', function() {
      const input = new Keyboard();
      input.importMap({});
      input.assign(1, input.LEFT);
      input.assign(2, input.RIGHT);
      expect(input.exportMap()).to.eql({'1': 'left', '2': 'right'});
      input.assign(123, input.UP);
      expect(input.exportMap()).to.eql({'1': 'left', '2': 'right', '123': 'up'});
      input.unassign(1);
      expect(input.exportMap()).to.eql({'2': 'right', '123': 'up'});
    });
  });

  describe('#importMap()', function() {
    it('should set and overwrite current map', function() {
      const input = new Keyboard();
      const triggerSpy = sinon.spy();
      input.events.bind(input.EVENT_TRIGGER, triggerSpy);
      input.importMap({'1': 'left', '123': 'up'});
      input.handleEvent({keyCode: 1, type: 'keydown'});
      expect(triggerSpy.callCount).to.be(1);
      expect(triggerSpy.lastCall.args).to.eql(['left', 'keydown']);
      input.handleEvent({keyCode: 123, type: 'keydown'});
      expect(triggerSpy.callCount).to.be(2);
      expect(triggerSpy.lastCall.args).to.eql(['up', 'keydown']);
      input.importMap({'13': 'down'});
      input.handleEvent({keyCode: 123, type: 'keydown'});
      expect(triggerSpy.callCount).to.be(2);
    });
  });
});
