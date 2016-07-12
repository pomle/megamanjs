'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env');
const Translate = env.Game.traits.Translate;

describe('Translate Trait', function() {
  it('should have a velocity', function() {
    const translate = new Translate;
    expect(translate.velocity.x).to.be.a('number');
    expect(translate.velocity.y).to.be.a('number');
  });
});
