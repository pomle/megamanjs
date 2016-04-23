var expect = require('expect.js');
var sinon = require('sinon');

var env = require('../../env.js');

describe('Climber / Climbable', function() {
  var climber;
  var climbable;
  var world;
  before(function() {
    world = new env.Engine.World();

    climber = new env.Engine.Object();
    climber.applyTrait(new env.Game.traits.Physics());
    climber.applyTrait(new env.Game.traits.Climber());
    climber.addCollisionRect(10, 10);

    climbable = new env.Engine.Object();
    climbable.applyTrait(new env.Game.traits.Climbable());
    climber.addCollisionRect(10, 100);

    world.addObject(climber);
    world.addObject(climbable);
  });
  context('when climber colliding with climbable', function() {
    it('should be obstructed when approaching from above', function() {
      climber.position.set(0, 80, 0);
      climbable.position.set(0, 0, 0);
      climber.velocity.set(0, -10);
      world.updateTime(0.1);
      expect(climber.position.y).to.be(10);
    });
  });
});
