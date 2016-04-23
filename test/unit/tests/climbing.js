var expect = require('expect.js');
var sinon = require('sinon');

var env = require('../../env.js');

describe('Climber / Climbable', function() {
  var climber;
  var climbable;
  var world;
  beforeEach(function() {
    world = new env.Engine.World();

    climber = new env.Engine.Object();
    climber.applyTrait(new env.Game.traits.Physics());
    climber.applyTrait(new env.Game.traits.Climber());
    climber.addCollisionRect(10, 10);

    climbable = new env.Engine.Object();
    climbable.applyTrait(new env.Game.traits.Climbable());
    climbable.addCollisionRect(10, 10);

    world.addObject(climber);
    world.addObject(climbable);
  });
  context('when climber colliding with climbable', function() {
    it('should be ignored when approaching from left', function() {
      climber.position.set(-10, 0, 0);
      climbable.position.set(0, 0, 0);
      climber.velocity.set(10, 0);
      world.updateTime(0.1);
      expect(climber.position.x).to.be(-9.5);
    });
    it('should be ignored when approaching from right', function() {
      climber.position.set(10, 0, 0);
      climbable.position.set(0, 0, 0);
      climber.velocity.set(-10, 0);
      world.updateTime(0.1);
      expect(climber.position.x).to.be(9.5);
    });
    it('should be ignored when approaching from bottom', function() {
      climber.position.set(0, -10, 0);
      climbable.position.set(0, 0, 0);
      climber.velocity.set(0, 10);
      world.updateTime(0.1);
      expect(climber.position.y).to.be(-9.5);
    });
    it('should be obstructed when approaching from above', function() {
      climber.position.set(0, 10, 0);
      climbable.position.set(0, 0, 0);
      climber.velocity.set(0, -10);
      world.updateTime(0.1);
      expect(climber.position.y).to.be(10);
    });
  });
});
