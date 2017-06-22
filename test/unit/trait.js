const expect = require('expect.js');
const sinon = require('sinon');

const Host = require('../../src/engine/Object');
const Trait = require('../../src/engine/Trait');

describe('Trait', function() {
  let MockTrait;
  let MockTrait2;
  before(() => {
    MockTrait = class extends Trait
    {
      constructor()
      {
        super();
        this.NAME = 'mockTrait';
        this.__collides = sinon.spy();
        this.__obstruct = sinon.spy();
        this.__uncollides = sinon.spy();
        this.__timeshift = sinon.spy();
      }
    }

    MockTrait.prototype.__collides = sinon.spy();
    MockTrait.prototype.__obstruct = sinon.spy();
    MockTrait.prototype.__uncollides = sinon.spy();
    MockTrait.prototype.__timeshift = sinon.spy();

    MockTrait2 = class extends Trait
    {
      constructor()
      {
        super();
        this.NAME = 'mockTrait2';
      }
    }
  });

  context('when applied', function() {
    let host;
    let trait;
    beforeEach(() => {
      host = new Host();
      trait = new MockTrait();
      host.applyTrait(trait);
    });

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
    it('should bind magic automatically', function() {
      const host = new Host();
      const trait = new MockTrait();
      trait.__attach(host);
      expect(host.events.bound(host.EVENT_COLLIDE, trait.__collides)).to.be(true);
      expect(host.events.bound(host.EVENT_UNCOLLIDE, trait.__uncollides)).to.be(true);
      expect(host.events.bound(host.EVENT_OBSTRUCT, trait.__obstruct)).to.be(true);
      expect(host.events.bound(host.EVENT_TIMESHIFT, trait.__timeshift)).to.be(true);
    });

    it('should set local host', function() {
      const host = new Host();
      const trait = new MockTrait();
      trait.__attach(host);
      expect(trait._host).to.be(host);
    });

    it('should except if host not Object', function() {
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
    it('should unbind magic methods', function() {
      const host = new Host();
      const trait = new MockTrait();
      trait.__attach(host);
      trait.__detach(host);
      expect(host.events.bound(host.EVENT_COLLIDE, trait.__collides)).to.be(false);
      expect(host.events.bound(host.EVENT_UNCOLLIDE, trait.__uncollides)).to.be(false);
      expect(host.events.bound(host.EVENT_OBSTRUCT, trait.__obstruct)).to.be(false);
      expect(host.events.bound(host.EVENT_TIMESHIFT, trait.__timeshift)).to.be(false);
    });

    it('should unset local host', function() {
      const host = new Host();
      const trait = new MockTrait();
      trait.__attach(host);
      trait.__detach(host);
      expect(trait._host).to.be(null);
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
