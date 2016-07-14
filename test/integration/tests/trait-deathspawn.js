'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env');
const World = env.Engine.World;
const Object = env.Engine.Object;
const Health = env.Game.traits.Health;
const DeathSpawn = env.Game.traits.DeathSpawn;

describe('DeathSpawn Trait', function() {
  function createDeathSpawner()
  {
    const obj = new Object;
    obj.applyTrait(new Health);
    obj.applyTrait(new DeathSpawn);
    return obj;
  }

  function createSpawnable()
  {
    return class Spawnable extends Object {
      constructor() {
        super();
      }
    }
  }

  it('should expose deathSpawn property on host', function() {
    const host = createDeathSpawner();
    expect(host.deathSpawn).to.be.a(DeathSpawn);
  });

  it('should place an instance of object from pool in world when host dies', function() {
      const obj = createDeathSpawner();
      const Spawnable = createSpawnable();
      obj.deathSpawn.pool.push(Spawnable);

      const world = new World;
      world.addObject(obj);
      obj.health.kill();

      expect(world.objects[1]).to.be.a(Spawnable);
  });
});
