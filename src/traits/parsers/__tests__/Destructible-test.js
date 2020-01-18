const expect = require('expect.js');

const {createNode} = require('@snakesilk/testing/xml');
const {Parser} = require('@snakesilk/xml-loader');
const {Destructible} = require('@snakesilk/megaman-traits');

const factory = require('..')['destructible'];

describe('Destructible factory', function() {
  let parser;

  beforeEach(() => {
    parser = new Parser.TraitParser();
  });

  it('creates a Destructible trait', () => {
    const node = createNode(`<trait/>`);
    trait = factory(parser, node)();
    expect(trait).to.be.a(Destructible);
  });

  describe('when no properties defined', () => {
    let trait;

    beforeEach(() => {
      const node = createNode(`<trait/>`);
      trait = factory(parser, node)();
    });

    it('has no affectors', () => {
      expect(trait.affectors.size).to.be(0);
    });
  });

  describe('when affectors given', () => {
    let trait;

    beforeEach(() => {
      const node = createNode(`<trait>
        <affectors>
          <entity id='crashbomb'/>
          <entity id='explosion'/>
        </affectors>
      </trait>`);
      trait = factory(parser, node)();
    });

    it('has given affectors', () => {
      expect(trait.affectors.size).to.equal(2);
      expect(trait.affectors.has('crashbomb')).to.be(true);
      expect(trait.affectors.has('explosion')).to.be(true);
    });
  });
});
