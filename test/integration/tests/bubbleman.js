'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const loadLevel = require('../../level-loader').loadLevel;

describe('Bubbleman Level', function() {
  let level;
  before(function(done) {
    loadLevel('Bubbleman').then(function(_level) {
      level = _level;
      done();
    }).catch(done);
  });

  it('should have falling platforms that are solid', function() {
    var block = level.world.getObject('falling-block');
    expect(block.solid.fixed).to.be(true);
    expect(block.solid.obstructs).to.be(true);
  });
});
