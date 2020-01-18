const expect = require('expect.js');
const sinon = require('sinon');

const {Entity} = require('@snakesilk/engine');
const Weapon = require('../Weapon');

describe('Weapon', () => {
  let weapon, host;

  describe('on instantiation', () => {
    beforeEach(() => {
      weapon = new Weapon();
    });

    it('has name', () => {
      expect(weapon.NAME).to.be('weapon');
    });

    describe('when applied', () => {
      beforeEach(() => {
        host = new Entity();
        host.applyTrait(weapon);
      });

      it('exposes trait as "weapon"', () => {
        expect(host.weapon).to.be(weapon);
      });
    });
  });
});
