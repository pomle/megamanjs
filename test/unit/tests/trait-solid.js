'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env');

const Object = env.Engine.Object;
const Solid = env.Game.traits.Solid;

describe('Solid Trait', function() {
  const step = 1/120;

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
    const object1 = new Object;
    const object2 = new Object;
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
});
