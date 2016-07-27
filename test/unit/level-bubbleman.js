'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const loadLevel = require('../level-loader').loadLevel;

describe('Bubbleman Level', function() {
  it.skip('should have falling platforms that are solid', function() {
    const block = level.world.getObject('falling-block');
    expect(block.solid.fixed).to.be(true);
    expect(block.solid.obstructs).to.be(true);
  });
});
