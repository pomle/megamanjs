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
});
