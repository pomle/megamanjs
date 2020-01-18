const expect = require('expect.js');

const {Entity} = require('@snakesilk/engine');
const Heatman = require('../Heatman');

describe('Heatman', () => {
  it('is an instance of entity', () => {
    const instance = new Heatman();
    expect(instance).to.be.a(Entity);
  });
});
