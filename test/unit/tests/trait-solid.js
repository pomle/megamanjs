'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env.js');

const Obj = env.Engine.Object;
const World = env.Engine.World;
const Character = env.Game.objects.Character;
const Physics = env.Game.traits.Physics;
const Solid = env.Game.traits.Solid;

describe('Solid Trait', function() {
  const step = 1/120;

  context('when instantiating', function() {
    it('should have name set to "solid"', function() {
      const trait = new Game.traits.Solid();
      expect(trait.NAME).to.be('solid');
    });

    it('should have fixed and obstructs set to false', function() {
      const trait = new Game.traits.Solid();
      expect(trait.fixed).to.be(false);
      expect(trait.obstructs).to.be(false);
    });
  });

  context('when supporting a character', function() {
    it('should consistently provide ground support', function() {
      const world = new World();
      world.gravityForce.set(0, 10);
      const ground = new Obj();
      ground.applyTrait(new Solid());
      ground.solid.fixed = true;
      ground.solid.obstructs = true;
      ground.addCollisionRect(100, 10);
      ground.position.set(0, 0, 0);
      const actor = new Character();
      actor.addCollisionRect(10, 10);
      actor.position.set(0, 9, 0);
      actor.applyTrait(new Solid());
      actor.applyTrait(new Physics());
      actor.physics.mass = 1;
      world.addObject(actor);
      world.addObject(ground);

      let count = 0;
      while (count++ < 120) {
          world.updateTime(step);
          expect(actor.position.y).to.equal(10);
      }
    });
  });
});
