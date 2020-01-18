const expect = require('expect.js');
const sinon = require('sinon');

const {Entity} = require('@snakesilk/engine');
const Pickupable = require('../Pickupable');

describe('Pickupable', () => {
  let pickupable, host;

  describe('on instantiation', () => {
    beforeEach(() => {
      pickupable = new Pickupable();
    });

    it('has name', () => {
      expect(pickupable.NAME).to.be('pickupable');
    });

    describe('when applied', () => {
      beforeEach(() => {
        host = new Entity();
        host.applyTrait(pickupable);
      });

      it('exposes trait as "pickupable"', () => {
        expect(host.pickupable).to.be(pickupable);
      });
    });
  });
});
