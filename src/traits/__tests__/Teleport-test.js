const expect = require('expect.js');
const sinon = require('sinon');

const {Entity} = require('@snakesilk/engine');
const {Physics} = require('@snakesilk/platform-traits');

const Teleport = require('../Teleport');

describe('Teleport Trait', function() {
  describe('on instantiation', function() {
    let teleport;
    before(function() {
       teleport = new Teleport;
    });

    it('has name "teleport"', function() {
      expect(teleport.NAME).to.be('teleport');
    });

    it('has startDuration .15', function() {
      expect(teleport.startDuration).to.be(.15);
    });

    it('has endDuration .15', function() {
      expect(teleport.endDuration).to.be(.15);
    });

    it('has a speed set to 900', function() {
      expect(teleport.speed).to.be(900);
    });

    it('is in off state', function() {
      expect(teleport.state).to.be(teleport.STATE_OFF);
    });
  });

  describe('when applied successfully', function() {
    let host;
    before(function() {
      host = new Entity();
      host.applyTrait(new Physics);
      host.applyTrait(new Teleport);
    });

    it('exposes itself on host', function() {
      expect(host.teleport).to.be.a(Teleport);
    });

    describe('when started with to()', function() {
      let spy = sinon.spy();
      before(function() {
        host.events.bind(host.teleport.EVENT_START, spy);
        host.teleport.to({x: 500, y: 250})
      });

      after(function() {
        host.events.unbind(host.teleport.EVENT_START, spy);
      });

      it('state is set to IN', function() {
        expect(host.teleport.state).to.be(host.teleport.STATE_IN);
      });

      it('enter countdown is started', function() {
        expect(host.teleport._startProgress).to.be(host.teleport.startDuration);
      });

      it('turns off collision detection on host', function() {
        expect(host.collidable).to.be(false);
      });

      it('disables physics on host', function() {
        expect(host.physics._enabled).to.be(false);
      });

      it('EVENT_START event has been emitted', function() {
        expect(spy.callCount).to.be(1);
      });

      describe('after start duration', function() {
        before(function() {
          host.timeShift(host.teleport.startDuration);
          host.timeShift(0);
        });

        it('state is set to GO', function() {
          expect(host.teleport.state).to.be(host.teleport.STATE_GO);
        });

        it('position has not changed', function() {
          expect(host.position).to.eql({x: 0, y: 0, z: 0});
        });
      });

      describe('after .1 second', function() {
        before(function() {
          host.timeShift(.1);
        });

        it('position is incremented', function() {
          expect(host.position).to.eql({x: 90, y: 90, z: 0});
        });
      });

      describe('after .5 seconds', function() {
        let spy = sinon.spy();
        before(function() {
          host.events.bind(host.teleport.EVENT_DEST_REACHED, spy);
          host.timeShift(.5);
        });

        after(function() {
          host.events.unbind(host.teleport.EVENT_DEST_REACHED, spy);
        });

        it('host has reached destination', function() {
          expect(host.position).to.eql({x: 500, y: 250, z: 0});
        });

        it('EVENT_DEST_REACHED event has been emitted', function() {
          expect(spy.callCount).to.be(1);
        });

        it('state is set to OUT', function() {
          expect(host.teleport.state).to.be(host.teleport.STATE_OUT);
        });

        it('exit countdown is started', function() {
          expect(host.teleport._endProgress).to.be(host.teleport.endDuration);
        });
      });

      describe('after end duration', function() {
        let spy = sinon.spy();
        before(function() {
          host.events.bind(host.teleport.EVENT_END, spy);
          host.timeShift(host.teleport.endDuration);
          host.timeShift(0);
        });

        after(function() {
          host.events.unbind(host.teleport.EVENT_END, spy);
        });

        it('enables physics on host', function() {
          expect(host.physics._enabled).to.be(true);
        });

        it('turns on collision detection on host', function() {
          expect(host.collidable).to.be(true);
        });

        it('EVENT_END event has been emitted', function() {
          expect(spy.callCount).to.be(1);
        });
      });
    });
  });

  describe('#reset()', function() {
    let host
    beforeEach(function() {
      host = new Entity();
      host.applyTrait(new Physics);
      host.applyTrait(new Teleport);
    });

    describe('when in the middle of teleport', function() {
      beforeEach(function() {
        host.teleport.nudge({x: 100, y: 100});
        host.timeShift(1);
        host.teleport.reset();
      });

      it('stops current teleportation', function() {
        expect(host.teleport.state).to.be(host.teleport.STATE_OFF);
        expect(host.teleport._endProgress).to.be(0);
        expect(host.teleport._startProgress).to.be(0);
        expect(host.teleport._destination).to.be(null);
      });
    });
  });
});
