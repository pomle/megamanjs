'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const loadLevel = require('../../level-loader').loadLevel;

describe('Heatman Level', function() {
  let level;
  before(function(done) {
    loadLevel('Heatman').then(function(_level) {
      level = _level;
      done();
    }).catch(done);
  });

  it('should have pho blocks that are solid', function() {
    var block = level.world.getObject('pho-block');
    expect(block.solid.fixed).to.be(true);
    expect(block.solid.obstructs).to.be(true);
  });
});
