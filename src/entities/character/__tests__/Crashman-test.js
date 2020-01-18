const expect = require('expect.js');

const {Entity} = require('@snakesilk/engine');
const Crashman = require('../Crashman');

describe('Crashman', () => {
  it('is an instance of entity', () => {
    const instance = new Crashman();
    expect(instance).to.be.a(Entity);
  });
});
