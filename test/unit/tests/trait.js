var expect = require('expect.js');
var sinon = require('sinon');

var env = require('../../importer.js');

var extend = env.Engine.Util.extend;
var Host = env.Engine.Object;
var Trait = env.Engine.Trait;

describe('Trait', function() {
  var MockTrait = function() {
    Trait.apply(this, arguments);
  }
  extend(MockTrait, Trait);
  MockTrait.prototype.NAME = 'mockTrait';
  MockTrait.prototype.__collides = sinon.spy();
  MockTrait.prototype.__obstruct = sinon.spy();
  MockTrait.prototype.__uncollides = sinon.spy();
  MockTrait.prototype.__timeshift = sinon.spy();

  it('should bind magic methods when applied', function() {
    var host = new Host();
    var trait = new MockTrait();
    host.applyTrait(trait);
    expect(host.events[host.EVENT_COLLIDE]).to.contain(trait.__collides);
    expect(host.events[host.EVENT_OBSTRUCT]).to.contain(trait.__obstruct);
    expect(host.events[host.EVENT_UNCOLLIDE]).to.contain(trait.__uncollides);
    expect(host.events[host.EVENT_TIMESHIFT]).to.contain(trait.__timeshift);
  });
  describe('#__attach', function() {
    it('should bind magic methods automatically', function() {
      var host = new Host();
      var trait = new MockTrait();
      trait.__on = sinon.spy();
      trait.__attach(host);
      expect(trait.__on.callCount).to.equal(1);
    });
    it('should set local host', function() {
      var host = new Host();
      var trait = new MockTrait();
      trait.__attach(host);
      expect(trait._host).to.be(host);
    });
    it('should except if host not Object', function() {
      var host = new Host();
      var trait = new MockTrait();
      expect(function() {
        trait.__attach('a');
      }).to.throwError(function(error) {
        expect(error).to.be.a(TypeError);
        expect(error.message).to.equal('Invalid host');
      });
    });
    it('should except if host already set', function() {
      var host = new Host();
      var trait = new MockTrait();
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
      var host = new Host();
      var trait = new MockTrait();
      trait.__on = sinon.spy();
      trait.__off = sinon.spy();
      trait.__attach(host);
      trait.__detach(host);
      expect(trait.__off.callCount).to.equal(1);
    });
    it('should unset local host', function() {
      var host = new Host();
      var trait = new MockTrait();
      trait.__attach(host);
      trait.__detach(host);
      expect(trait._host).to.be(undefined);
    });
    it('should except if host already set', function() {
      var host = new Host();
      var trait = new MockTrait();
      trait.__attach(host);
      expect(function() {
        trait.__attach(host);
      }).to.throwError(function(error) {
        expect(error).to.be.an(Error);
        expect(error.message).to.equal('Already attached');
      });
    });
  });
  describe('#__off', function() {
    it('should unbind magic methods if bound', function() {
      var host = new Host();
      var trait = new MockTrait();
      host.applyTrait(trait);
      expect(trait._bound).to.be(true);
      expect(host.events[host.EVENT_COLLIDE]).to.contain(trait.__collides);
      expect(host.events[host.EVENT_OBSTRUCT]).to.contain(trait.__obstruct);
      expect(host.events[host.EVENT_UNCOLLIDE]).to.contain(trait.__uncollides);
      expect(host.events[host.EVENT_TIMESHIFT]).to.contain(trait.__timeshift);
      trait.__off();
      expect(trait._bound).to.be(false);
      expect(host.events[host.EVENT_COLLIDE]).not.to.contain(trait.__collides);
      expect(host.events[host.EVENT_OBSTRUCT]).not.to.contain(trait.__obstruct);
      expect(host.events[host.EVENT_UNCOLLIDE]).not.to.contain(trait.__uncollides);
      expect(host.events[host.EVENT_TIMESHIFT]).not.to.contain(trait.__timeshift);
    });
  });
  describe('#__on', function() {
    it('should bind magic methods if unbound', function() {
      var host = new Host();
      var trait = new MockTrait();
      host.applyTrait(trait);
      expect(trait._bound).to.be(true);
      trait.__off();
      expect(trait._bound).to.be(false);
      expect(host.events[host.EVENT_COLLIDE]).not.to.contain(trait.__collides);
      expect(host.events[host.EVENT_OBSTRUCT]).not.to.contain(trait.__obstruct);
      expect(host.events[host.EVENT_UNCOLLIDE]).not.to.contain(trait.__uncollides);
      expect(host.events[host.EVENT_TIMESHIFT]).not.to.contain(trait.__timeshift);
      trait.__on();
      expect(trait._bound).to.be(true);
      expect(host.events[host.EVENT_COLLIDE]).to.contain(trait.__collides);
      expect(host.events[host.EVENT_OBSTRUCT]).to.contain(trait.__obstruct);
      expect(host.events[host.EVENT_UNCOLLIDE]).to.contain(trait.__uncollides);
      expect(host.events[host.EVENT_TIMESHIFT]).to.contain(trait.__timeshift);
    });
    it('should only bind each magic method once ever', function() {
      var host = new Host();
      var trait = new MockTrait();
      host.applyTrait(trait);
      expect(trait._bound).to.be(true);
      expect(host.events[host.EVENT_COLLIDE]).to.contain(trait.__collides);
      expect(host.events[host.EVENT_OBSTRUCT]).to.contain(trait.__obstruct);
      expect(host.events[host.EVENT_UNCOLLIDE]).to.contain(trait.__uncollides);
      expect(host.events[host.EVENT_TIMESHIFT]).to.contain(trait.__timeshift);

      var lengths = {};
      lengths[host.EVENT_COLLIDE] = host.events[host.EVENT_COLLIDE].length;
      lengths[host.EVENT_OBSTRUCT] = host.events[host.EVENT_OBSTRUCT].length;
      lengths[host.EVENT_UNCOLLIDE] = host.events[host.EVENT_UNCOLLIDE].length;
      lengths[host.EVENT_TIMESHIFT] = host.events[host.EVENT_TIMESHIFT].length;

      trait.__on();
      expect(trait._bound).to.be(true);
      expect(host.events[host.EVENT_COLLIDE]).to.have.length(lengths[host.EVENT_COLLIDE]);
      expect(host.events[host.EVENT_OBSTRUCT]).to.have.length(lengths[host.EVENT_OBSTRUCT]);
      expect(host.events[host.EVENT_UNCOLLIDE]).to.have.length(lengths[host.EVENT_UNCOLLIDE]);
      expect(host.events[host.EVENT_TIMESHIFT]).to.have.length(lengths[host.EVENT_TIMESHIFT]);
    });
  });
  describe('#__require', function() {
    it('should except if required trait not already applied', function() {
      var host = new Host();
      var trait = new MockTrait();
      expect(function() {
        trait.__require(host, MockTrait);
      }).to.throwError(function(error) {
        expect(error).to.be.an(Error);
        expect(error.message).to.equal('Required trait "mockTrait" not found');
      });
    });
  });
});
