const expect = require('expect.js');
const sinon = require('sinon');

const Entity = require('../../src/engine/Object');
const World = require('../../src/engine/World');
const Solid = require('../../src/engine/traits/Solid');

describe('Solid Trait', function() {
  const step = 1/120;

  function createSolid()
  {
    const host = new Entity;
    host.addCollisionRect(10, 10);
    host.applyTrait(new Solid);
    return host;
  }

  context('when instantiating', function() {
    it('should have name set to "solid"', function() {
      const trait = new Solid;
      expect(trait.NAME).to.be('solid');
    });

    it('should have fixed and obstructs set to false', function() {
      const trait = new Solid;
      expect(trait.fixed).to.be(false);
      expect(trait.obstructs).to.be(false);
    });
  });

  describe('#attackDirection()', function() {
    const solid = new Solid;
    const object1 = new Entity;
    const object2 = new Entity;
    object1.addCollisionRect(10, 10);
    object2.addCollisionRect(10, 10);

    it('should detect direction from above', function() {
      object1.position.set(0, 0, 0);
      object2.position.set(0, 9, 0);
      expect(solid.attackDirection(object1.collision[0], object2.collision[0])).to.be(solid.TOP);
    });

    it('should detect direction from below', function() {
      object1.position.set(0, 9, 0);
      object2.position.set(0, 0, 0);
      expect(solid.attackDirection(object1.collision[0], object2.collision[0])).to.be(solid.BOTTOM);
    });

    it('should detect direction from left', function() {
      object1.position.set(9, 0, 0);
      object2.position.set(0, 0, 0);
      expect(solid.attackDirection(object1.collision[0], object2.collision[0])).to.be(solid.LEFT);
    });

    it('should detect direction from right', function() {
      object1.position.set(0, 0, 0);
      object2.position.set(9, 0, 0);
      expect(solid.attackDirection(object1.collision[0], object2.collision[0])).to.be(solid.RIGHT);
    });
  });

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
