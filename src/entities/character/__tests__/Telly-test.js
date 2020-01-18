const expect = require('expect.js');

const {Entity} = require('@snakesilk/engine');
const Telly = require('../Telly');

describe('Telly', () => {
  it('is an instance of entity', () => {
    const instance = new Telly();
    expect(instance).to.be.a(Entity);
  });
});
