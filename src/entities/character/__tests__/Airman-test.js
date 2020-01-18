const expect = require('expect.js');

const {Entity} = require('@snakesilk/engine');
const Airman = require('../Airman');

describe('Airman', () => {
  it('is an instance of entity', () => {
    const instance = new Airman();
    expect(instance).to.be.a(Entity);
  });
});
