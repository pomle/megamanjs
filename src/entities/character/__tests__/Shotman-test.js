const expect = require('expect.js');

const {Entity} = require('@snakesilk/engine');
const Shotman = require('../Shotman');

describe('Shotman', () => {
  it('is an instance of entity', () => {
    const instance = new Shotman();
    expect(instance).to.be.a(Entity);
  });
});
