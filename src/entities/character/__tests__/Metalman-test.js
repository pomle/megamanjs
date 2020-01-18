const expect = require('expect.js');

const {Entity} = require('@snakesilk/engine');
const Metalman = require('../Metalman');

describe('Metalman', () => {
  it('is an instance of entity', () => {
    const instance = new Metalman();
    expect(instance).to.be.a(Entity);
  });
});
