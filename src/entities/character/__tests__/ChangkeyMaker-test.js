const expect = require('expect.js');

const {Entity} = require('@snakesilk/engine');
const ChangkeyMaker = require('../ChangkeyMaker');

describe('ChangkeyMaker', () => {
  it('is an instance of entity', () => {
    const instance = new ChangkeyMaker();
    expect(instance).to.be.a(Entity);
  });
});
