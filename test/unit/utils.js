const expect = require('expect.js');
const sinon = require('sinon');

const Util = require('../../src/engine/Util');

describe('Util', function() {
  describe('#renameFunction', () => {
    it('returns a function with a new name', () => {
      const res = Util.renameFunction('foo', function bar() {});
      expect(res.name).to.be('foo');
    });

    it('supports > 1 string length', () => {
      const result = Util.string.fill('_!', 4);
      expect(result).to.be('_!_!_!_!');
    });

    it('supports 0 as repeat argument', () => {
      const result = Util.string.fill('_', 0);
      expect(result).to.be('');
    });
  });

  describe('#string.fill', () => {
    it('returns argument #1 repeated arguement #2 times', () => {
      const result = Util.string.fill('_', 4);
      expect(result).to.be('____');
    });

    it('supports > 1 string length', () => {
      const result = Util.string.fill('_!', 4);
      expect(result).to.be('_!_!_!_!');
    });

    it('supports 0 as repeat argument', () => {
      const result = Util.string.fill('_', 0);
      expect(result).to.be('');
    });
  });
});
