'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env.js');

const World = env.Engine.World;
const Spawnable = env.Engine.Object;
const Spawner = env.Game.objects.Spawner;

describe('Spawner', function() {
  context('on instantiation', function() {
    const spawner = new Spawner();
    it('should no max and min distance set', function() {
      expect(spawner.maxDistance).to.be(null);
      expect(spawner.minDistance).to.be(null);
    });
    it('should have no children', function() {
      expect(spawner.getChildren()).to.have.length(0);
    });
    it('should have interval set to 1', function() {
      expect(spawner.interval).to.be(1);
    });
    it('should have count set to infinity', function() {
      expect(spawner.maxTotalSpawns).to.be(Infinity);
    });
    it('should not have a lifetime limit set', function() {
      expect(spawner.childLifetime).to.be(null);
    });
    it('should have max simultaneous spawns set to 1', function() {
      expect(spawner.maxSimultaneousSpawns).to.be(1);
    });
    it('should not have a roaming limit set', function() {
      expect(spawner.roamingLimit).to.be(null);
    });
  });
});
