var expect = require('expect.js');
var sinon = require('sinon');

var env = require('../../env.js');

var Obj = env.Engine.Object;
var World = env.Engine.World;
var Character = env.Game.objects.Character;
var Physics = env.Game.traits.Physics;
var Solid = env.Game.traits.Solid;

describe('Trait', function() {
  var step = 1/120;
  describe('Solid', function() {
    context('when instantiating', function() {
      var trait = new Game.traits.Solid();
      it('should have name set to "solid"', function() {
        expect(trait.NAME).to.be('solid');
      });
      it('should have fixed set to false', function() {
        expect(trait.fixed).to.be(false);
        expect(trait.obstructs).to.be(false);
      });
    });
    context('when supporting a character', function() {
      it('should consistently provide ground support', function() {
        var world = new World();
        world.gravityForce.set(0, 10);
        var ground = new Obj();
        ground.applyTrait(new Solid());
        ground.solid.fixed = true;
        ground.solid.obstructs = true;
        ground.addCollisionRect(100, 10);
        ground.position.set(0, 0, 0);
        var actor = new Character();
        actor.addCollisionRect(10, 10);
        actor.position.set(0, 9, 0);
        actor.applyTrait(new Solid());
        actor.applyTrait(new Physics());
        actor.physics.mass = 1;
        world.addObject(actor);
        world.addObject(ground);

        var count = 0;
        while (count++ < 120) {
            world.updateTime(step);
            expect(actor.position.y).to.equal(10);
        }
      });
    });
  });
});
