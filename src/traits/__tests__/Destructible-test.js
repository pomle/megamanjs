const expect = require('expect.js');
const sinon = require('sinon');

const {Entity} = require('@snakesilk/engine');
const Destructible = require('../Destructible');

describe('Destructible', () => {
  let destructible, host;

  describe('on instantiation', () => {
    beforeEach(() => {
      destructible = new Destructible();
    });

    it('has name', () => {
      expect(destructible.NAME).to.be('destructible');
    });

    describe('when applied', () => {
      beforeEach(() => {
        host = new Entity();
        host.applyTrait(destructible);
      });

      it('exposes trait as "destructible"', () => {
        expect(host.destructible).to.be(destructible);
      });
    });
  });
});
