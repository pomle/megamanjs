const expect = require('expect.js');

const {createNode} = require('@snakesilk/testing/xml');
const {Parser} = require('@snakesilk/xml-loader');
const {Weapon} = require('@snakesilk/megaman-traits');

const factory = require('..')['weapon'];

describe('Weapon factory', function() {
  let parser;

  beforeEach(() => {
    parser = new Parser.TraitParser();
  });

  it('creates a Weapon trait', () => {
    const node = createNode(`<trait/>`);
    trait = factory(parser, node)();
    expect(trait).to.be.a(Weapon);
  });

  describe('when no properties defined', () => {
    let trait;

    beforeEach(() => {
      const node = createNode(`<trait/>`);
      trait = factory(parser, node)();
    });

    it('offset is 0, 0', () => {
      expect(trait.projectileEmitOffset).to.eql({x: 0, y: 0});
    });

    it('radius is 0', () => {
      expect(trait.projectileEmitRadius).to.be(0);
    });
  });

  describe('when offset set', () => {
    let trait;

    beforeEach(() => {
      const node = createNode(`<trait>
        <projectile-emit x="12.234" y="-0.123" />
      </trait>`);
      trait = factory(parser, node)();
    });

    it('offset is honored', () => {
      expect(trait.projectileEmitOffset).to.eql({x: 12.234, y: -0.123});
    });
  });

  describe('when radius set', () => {
    let trait;

    beforeEach(() => {
      const node = createNode(`<trait>
        <projectile-emit r="5.123"/>
      </trait>`);
      trait = factory(parser, node)();
    });

    it('radius is honored', () => {
      expect(trait.projectileEmitRadius).to.equal(5.123);
    });
  });

  describe('when both radius and offset set', () => {
    let trait;

    beforeEach(() => {
      const node = createNode(`<trait>
        <projectile-emit x="32.123" y="23.23" r="6.42"/>
      </trait>`);
      trait = factory(parser, node)();
    });

    it('offset is honored', () => {
      expect(trait.projectileEmitOffset).to.eql({x: 32.123, y: 23.23});
    });

    it('radius is honored', () => {
      expect(trait.projectileEmitRadius).to.equal(6.42);
    });
  });
});
