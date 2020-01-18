const expect = require('expect.js');

const {Entity} = require('@snakesilk/engine');
const SniperArmor = require('../SniperArmor');

describe('SniperArmor', () => {
  it('is an instance of entity', () => {
    const instance = new SniperArmor();
    expect(instance).to.be.a(Entity);
  });
});
