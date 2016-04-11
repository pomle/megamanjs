var expect = require('expect.js');
var sinon = require('sinon');

var env = require('../../importer.js');

var extend = env.Engine.Util.extend;
var Host = env.Engine.Object;
var Trait = env.Engine.Trait;

describe('Object', function() {
  var MockTrait = function() {
    Trait.apply(this, arguments);
  }
  extend(MockTrait, Trait);
  MockTrait.prototype.NAME = 'mockTrait';

  describe('#applyTrait', function() {
    it('should exposed trait name on host', function() {
      var host = new Host();
      var trait = new MockTrait();
      host.applyTrait(trait);
      expect(host.mockTrait).to.be(trait);
    });
    it('should except if trait name occupied', function() {
      var host = new Host();
      var trait = new MockTrait();
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
