const expect = require('expect.js');
const sinon = require('sinon');

const {createNode} = require('@snakesilk/testing/xml');
const {Parser} = require('@snakesilk/xml-loader');
const {Elevator} = require('@snakesilk/megaman-traits');

const factory = require('..')['elevator'];

describe('Elevator factory', function() {
  let parser;

  beforeEach(() => {
    sinon.stub(Elevator.prototype, 'addNode');
    parser = new Parser.TraitParser();
  });

  afterEach(() => {
    Elevator.prototype.addNode.restore();
  });

  it('creates a Elevator trait', () => {
    const node = createNode(`<trait/>`);
    trait = factory(parser, node)();
    expect(trait).to.be.a(Elevator);
  });

  describe('when no properties defined', () => {
    let trait;

    beforeEach(() => {
      const node = createNode(`<trait/>`);
      trait = factory(parser, node)();
    });

    it('has speed 10', () => {
      expect(trait.speed).to.be(10);
    });

    it('has no nodes', () => {
      expect(trait.addNode.callCount).to.be(0);
    });
  });

  describe('when speed defined', () => {
    let trait;

    beforeEach(() => {
      const node = createNode(`<trait>
        <path speed="215.12"/>
      </trait>`);
      trait = factory(parser, node)();
    });

    it('has speed set', () => {
      expect(trait.speed).to.be(215.12);
    });
  });

  describe('when nodes defined', () => {
    let trait;

    beforeEach(() => {
      const node = createNode(`<trait>
        <path speed="215.12">
          <node x="-176" y="0"/>
          <node x="0" y="96"/>
          <node x="176" y="0"/>
        </path>
      </trait>`);
      trait = factory(parser, node)();
    });

    it('has nodes set', () => {
      expect(trait.addNode.callCount).to.be(3);
      expect(trait.addNode.getCall(0).args).to.eql([{
        x: -176,
        y: 0,
      }])
      expect(trait.addNode.getCall(1).args).to.eql([{
        x: 0,
        y: 96,
      }])
      expect(trait.addNode.getCall(2).args).to.eql([{
        x: 176,
        y: 0,
      }])
    });
  });
});
