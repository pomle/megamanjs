'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env.js');

describe('Climber / Climbable', function() {
  let climber;
  let climbable;
  let world;
  beforeEach(function() {
    world = new env.Engine.World();

    climber = new env.Engine.Object();
    climber.applyTrait(new env.Game.traits.Solid());
    climber.applyTrait(new env.Game.traits.Climber());
    climber.addCollisionRect(10, 10);

    climbable = new env.Engine.Object();
    climbable.applyTrait(new env.Game.traits.Climbable());
    climbable.addCollisionRect(10, 10);

    world.addObject(climber);
    world.addObject(climbable);
  });
  it('should grab climbable when aiming up and overlapping', function() {
    climber.position.set(0, 0, 0);
    climbable.position.set(0, 0, 0);
    climber.aim.y = 1;
    world.updateTime(0.1);
    expect(climber.climber.attached).to.be(climbable);
    climber.climber.release();
  });
  it('should grab climbable when aiming down and overlapping', function() {
    climber.position.set(0, 0, 0);
    climbable.position.set(0, 0, 0);
    climber.aim.y = -1;
    world.updateTime(0.1);
    expect(climber.climber.attached).to.be(climbable);
    climber.climber.release();
  });
  context('when climber colliding with climbable', function() {
    it('should be ignored when approaching from left', function() {
      climber.aim.set(0, 0);
      climber.position.set(-10, 0, 0);
      climbable.position.set(0, 0, 0);
      climber.velocity.set(10, 0);
      world.updateTime(0.1);
      expect(climber.position.x).to.be(-9.5);
    });
    it('should be ignored when approaching from right', function() {
      climber.aim.set(0, 0);
      climber.position.set(10, 0, 0);
      climbable.position.set(0, 0, 0);
      climber.velocity.set(-10, 0);
      world.updateTime(0.1);
      expect(climber.position.x).to.be(9.5);
    });
    it('should be ignored when approaching from bottom', function() {
      climber.aim.set(0, 0);
      climber.position.set(0, -10, 0);
      climbable.position.set(0, 0, 0);
      climber.velocity.set(0, 10);
      world.updateTime(0.1);
      expect(climber.position.y).to.be(-9.5);
    });
    it('should be obstructed when approaching from above', function() {
      climber.aim.set(0, 0);
      climber.position.set(0, 10, 0);
      climbable.position.set(0, 0, 0);
      climber.velocity.set(0, -10);
      world.updateTime(0.1);
      expect(climber.position.y).to.be(10);
    });
  });
});
