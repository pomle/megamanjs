'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env.js');
const World = env.Engine.World;
const Object = env.Engine.Object;
const Solid = env.Game.traits.Solid;

describe('Solid Trait', function() {
  function createSolid()
  {
    const host = new Object;
    host.addCollisionRect(10, 10);
    host.applyTrait(new Solid);
    return host;
  }

  context('when supporting an object', function() {
    it('should consistently provide ground support', function() {
      const world = new World();
      const ground = createSolid();
      ground.solid.fixed = true;
      ground.solid.obstructs = true;
      ground.position.set(0, 0, 0);
      const actor = createSolid();
      actor.position.set(0, 9, 0);
      world.addObject(actor);
      world.addObject(ground);

      let count = 0;
      const step = 1/60;
      while (count++ < 20) {
          actor.velocity.set(0, -100);
          world.simulateTime(step);
          expect(actor.position.y).to.equal(10);
      }
    });
  });
});
