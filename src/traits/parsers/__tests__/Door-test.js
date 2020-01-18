const expect = require('expect.js');
const sinon = require('sinon');

const {createNode} = require('@snakesilk/testing/xml');
const {Parser} = require('@snakesilk/xml-loader');
const {Door} = require('@snakesilk/megaman-traits');

const factory = require('..')['door'];

describe('Door factory', function() {
  let parser;

  beforeEach(() => {
    parser = new Parser.TraitParser();
  });

  it('creates a Door trait', () => {
    const node = createNode(`<trait/>`);
    trait = factory(parser, node)();
    expect(trait).to.be.a(Door);
  });

  describe('when no properties defined', () => {
    let trait;

    beforeEach(() => {
      const node = createNode(`<trait/>`);
      trait = factory(parser, node)();
    });

    it('has duration .6', () => {
      expect(trait.duration).to.be(.6);
    });

    it('has oneWay set to false', () => {
      expect(trait.oneWay).to.be(false);
    });

    it('has speed 30', () => {
      expect(trait.speed).to.be(30);
    });

    it('has neutral direction', () => {
      expect(trait.direction).to.eql({x: 0, y: 0});
    });
  });

  describe('when direction specified', () => {
    let trait;

    beforeEach(() => {
      const node = createNode(`<trait>
        <direction x="-1" y=".3"/>
      </trait>`);
      trait = factory(parser, node)();
    });

    it('sets direction', () => {
      expect(trait.direction).to.eql({x: -1, y: 0.3});
    });
  });

  [true, false].forEach(bool => {
    describe(`when one-way set to ${bool}`, () => {
      let trait;

      beforeEach(() => {
        const node = createNode(`<trait one-way="${bool}"/>`);
        trait = factory(parser, node)();
      });

      it(`sets onwWay to ${bool}`, () => {
        expect(trait.oneWay).to.be(bool);
      });
    });
  });
});
