const expect = require('expect.js');

const {createNode} = require('@snakesilk/testing/xml');
const {Loader} = require('@snakesilk/engine');
const {Parser} = require('@snakesilk/xml-loader');
const PlatformTraits = require('@snakesilk/platform-traits');
const MegamanTraits = require('@snakesilk/megaman-traits');

const registry = require('..');

describe('Registry', () => {
  let loader;

  beforeEach(() => {
    loader = new Loader();
    loader.traits.add(registry);
  });

  [
    ['conveyor', 'Conveyor', MegamanTraits],
    ['destructible', 'Destructible', MegamanTraits],
    ['door', 'Door', MegamanTraits],
    ['elevator', 'Elevator', MegamanTraits],
    ['fallaway', 'Fallaway', MegamanTraits],
    ['headlight', 'Headlight', MegamanTraits],
    ['stun', 'Stun', MegamanTraits],
    ['teleport', 'Teleport', MegamanTraits],
    ['weapon', 'Weapon', MegamanTraits],
  ].forEach(([shortName, traitName, source]) => {
    describe(`when trait node name is "${shortName}"`, function() {
      let parser, trait;

      beforeEach(() => {
        parser = new Parser.TraitParser(loader);
      });

      it(`returns a factory that creates ${traitName}`, () => {
        const node = createNode(`<trait name="${shortName}"/>`);
        return parser.parseTrait(node)
        .then(createTrait => {
          trait = createTrait();
          expect(trait).to.be.a(source[traitName]);
        });
      });
    });
  });

  [
    'attach',
    'climbable',
    'climber',
    'contact-damage',
    'death-spawn',
    'death-zone',
    'disappearing',
    'environment',
    'fixed-force',
    'glow',
    'health',
    'invincibility',
    'jump',
    'lifetime',
    'light',
    'light-control',
    'move',
    'physics',
    'pickupable',
    'projectile',
    'rotate',
    'solid',
    'spawn',
    'translate',
  ].forEach(shortName => {
    describe(`when trait node name is "${shortName}"`, function() {
      let parser, trait;

      beforeEach(() => {
        parser = new Parser.TraitParser(loader);
      });

      it('throws an error', () => {
        const node = createNode(`<trait name="${shortName}"/>`);
        expect(() => {
          trait = parser.parseTrait(node)();
        }).to.throwError(error => {
          expect(error).to.be.a(TypeError);
          expect(error.message).to.be(`Trait factory "${shortName}" does not exist.`);
        });
      });
    });
  });
});
