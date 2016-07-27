'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const loadLevel = require('../level-loader').loadLevel;

describe('Heatman Level', function() {
  it.skip('should have pho blocks that are solid', function() {
    const block = level.world.getObject('pho-block');
    expect(block.solid.fixed).to.be(true);
    expect(block.solid.obstructs).to.be(true);
  });
});
