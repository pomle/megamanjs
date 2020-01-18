const expect = require('expect.js');

const {Entity} = require('@snakesilk/engine');
const Flashman = require('../Flashman');

describe('Flashman', () => {
  it('is an instance of entity', () => {
    const instance = new Flashman();
    expect(instance).to.be.a(Entity);
  });
});
