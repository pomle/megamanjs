const expect = require('expect.js');

const {Entity} = require('@snakesilk/engine');
const SniperJoe = require('../SniperJoe');

describe('SniperJoe', () => {
  it('is an instance of entity', () => {
    const instance = new SniperJoe();
    expect(instance).to.be.a(Entity);
  });
});
