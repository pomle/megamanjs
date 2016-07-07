'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env.js');

const extend = env.Engine.Util.extend;
const Host = env.Engine.Object;
const Trait = env.Engine.Trait;

describe('Trait', function() {
  const MockTrait = function() {
    Trait.apply(this, arguments);
    this.__collides = sinon.spy();
    this.__obstruct = sinon.spy();
    this.__uncollides = sinon.spy();
    this.__timeshift = sinon.spy();
  }
  extend(MockTrait, Trait);
  MockTrait.prototype.NAME = 'mockTrait';
  MockTrait.prototype.__collides = sinon.spy();
  MockTrait.prototype.__obstruct = sinon.spy();
  MockTrait.prototype.__uncollides = sinon.spy();
  MockTrait.prototype.__timeshift = sinon.spy();

  const MockTrait2 = function() {
    Trait.apply(this, arguments);
  }
  extend(MockTrait2, Trait);
  MockTrait2.prototype.NAME = 'mockTrait2';

  context('when applied', function() {
    const host = new Host();
    const trait = new MockTrait();
    host.applyTrait(trait);
    it('should bind collide method', function() {
      host.events.trigger(host.EVENT_COLLIDE);
      expect(trait.__collides.callCount).to.be(1);
    });
    it('should bind uncollide method', function() {
      host.events.trigger(host.EVENT_UNCOLLIDE);
      expect(trait.__uncollides.callCount).to.be(1);
    });
    it('should bind obstruct method', function() {
      host.events.trigger(host.EVENT_OBSTRUCT);
      expect(trait.__obstruct.callCount).to.be(1);
    });
    it('should bind timeshift method', function() {
      host.events.trigger(host.EVENT_TIMESHIFT);
      expect(trait.__timeshift.callCount).to.be(1);
    });
  });
  describe('#__attach', function() {
    it('should bind magic methods automatically', function() {
      const host = new Host();
      const trait = new MockTrait();
      trait.__on = sinon.spy();
      trait.__attach(host);
      expect(trait.__on.callCount).to.equal(1);
    });
    it('should set local host', function() {
      const host = new Host();
      const trait = new MockTrait();
      trait.__attach(host);
      expect(trait._host).to.be(host);
    });
    it('should except if host not Object', function() {
      const host = new Host();
      const trait = new MockTrait();
      expect(function() {
        trait.__attach('a');
      }).to.throwError(function(error) {
        expect(error).to.be.a(TypeError);
        expect(error.message).to.equal('Invalid host');
      });
    });
    it('should except if host already set', function() {
      const host = new Host();
      const trait = new MockTrait();
      trait.__attach(host);
      expect(function() {
        trait.__attach(host);
      }).to.throwError(function(error) {
        expect(error).to.be.an(Error);
        expect(error.message).to.equal('Already attached');
      });
    });
  });
  describe('#__detach', function() {
    it('should unbind magic methods automatically', function() {
      const host = new Host();
      const trait = new MockTrait();
      trait.__on = sinon.spy();
      trait.__off = sinon.spy();
      trait.__attach(host);
      trait.__detach(host);
      expect(trait.__off.callCount).to.equal(1);
    });
    it('should unset local host', function() {
      const host = new Host();
      const trait = new MockTrait();
      trait.__attach(host);
      trait.__detach(host);
      expect(trait._host).to.be(undefined);
    });
    it('should except if host already set', function() {
      const host = new Host();
      const trait = new MockTrait();
      trait.__attach(host);
      expect(function() {
        trait.__attach(host);
      }).to.throwError(function(error) {
        expect(error).to.be.an(Error);
        expect(error.message).to.equal('Already attached');
      });
    });
  });
  context('when applied', function() {
    let host;
    let trait;

    beforeEach(function() {
      host = new Host();
      trait = new MockTrait();
      host.applyTrait(trait);
      trait.__off();
    });

    describe('#__off', function() {
      it('should release collide method', function() {
        host.events.trigger(host.EVENT_COLLIDE);
        expect(trait.__collides.callCount).to.be(0);
      });

      it('should release uncollide method', function() {
        host.events.trigger(host.EVENT_UNCOLLIDE);
        expect(trait.__uncollides.callCount).to.be(0);
      });

      it('should release obstruct method', function() {
        host.events.trigger(host.EVENT_OBSTRUCT);
        expect(trait.__obstruct.callCount).to.be(0);
      });

      it('should release timeshift method', function() {
        host.events.trigger(host.EVENT_TIMESHIFT);
        expect(trait.__timeshift.callCount).to.be(0);
      });
    });

    describe('#__on', function() {
      beforeEach(function() {
        trait.__on();
        trait.__on();
      });

      it('should bind collide method once', function() {
        host.events.trigger(host.EVENT_COLLIDE);
        expect(trait.__collides.callCount).to.be(1);
      });

      it('should bind uncollide method once', function() {
        host.events.trigger(host.EVENT_UNCOLLIDE);
        expect(trait.__uncollides.callCount).to.be(1);
      });

      it('should bind obstruct method once', function() {
        host.events.trigger(host.EVENT_OBSTRUCT);
        expect(trait.__obstruct.callCount).to.be(1);
      });

      it('should bind timeshift method once', function() {
        host.events.trigger(host.EVENT_TIMESHIFT);
        expect(trait.__timeshift.callCount).to.be(1);
      });
    });
  });

  describe('#__require', function() {
    it('should except if required trait not already applied', function() {
      const host = new Host();
      const trait = new MockTrait();
      expect(function() {
        trait.__require(host, MockTrait);
      }).to.throwError(function(error) {
        expect(error).to.be.an(Error);
        expect(error.message).to.equal('Required trait "mockTrait" not found');
      });
    });

    it('should return applied instance if found', function() {
      const host = new Host();
      const trait = new MockTrait();
      host.applyTrait(trait);
      expect(trait.__require(host, MockTrait)).to.be(trait);
    });
  });

  describe('#__requires', function() {
    it('should store trait references that are checked when applied', function() {
      const trait = new MockTrait();
      trait.__requires(MockTrait2);
      const host = new Host();
      expect(function() {
        host.applyTrait(trait);
      }).to.throwError(function(err) {
        expect(err).to.be.an(Error);
        expect(err.message).to.be('Required trait "mockTrait2" not found');
      });
    });
  });
});
