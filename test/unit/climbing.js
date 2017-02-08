const expect = require('expect.js');
const sinon = require('sinon');

const Object = require('../../src/engine/Object');
const World = require('../../src/engine/World');
const Climbable = require('../../src/engine/traits/Climbable');
const Climber = require('../../src/engine/traits/Climber');
const Solid = require('../../src/engine/traits/Solid');

describe('Climber / Climbable', function() {
  let climber;
  let climbable;
  let world;
  beforeEach(function() {
    world = new World();

    climber = new Object();
    climber.applyTrait(new Solid());
    climber.applyTrait(new Climber());
    climber.addCollisionRect(10, 10);

    climbable = new Object();
    climbable.applyTrait(new Climbable());
    climbable.addCollisionRect(10, 10);

    world.addObject(climber);
    world.addObject(climbable);
  });

  it('should grab climbable when aiming up and overlapping', function() {
    climber.position.set(0, 0, 0);
    climbable.position.set(0, 0, 0);
    climber.aim.y = 1;
    world.simulateTime(0.1);
    expect(climber.climber.attached).to.be(climbable);
    climber.climber.release();
  });

  it('should not grab climbable when aiming down and overlapping', function() {
    climber.position.set(0, 0, 0);
    climbable.position.set(0, 0, 0);
    climber.aim.y = -1;
    world.simulateTime(0.1);
    expect(climber.climber.attached).to.be(null);
    climber.climber.release();
  });

  it('should grab ladder when on top and aiming down', function() {
    climber.aim.set(0, -1);
    climber.position.set(0, 10, 0);
    climbable.position.set(0, 0, 0);
    climber.velocity.set(0, -10);
    world.simulateTime(0.1);
    expect(climber.climber.attached).to.be(climbable);
  });

  context('when attached to climbable', function() {
    it('should translate climber up/down using specified speed along climbable when aiming', function() {
      climber.aim.set(0, 1);
      climber.position.set(0, 0, 0);
      climber.climber.speed = 19;
      climbable.position.set(0, 0, 0);
      world.simulateTime(0.1);
      world.simulateTime(0.1);
      expect(climber.position).to.eql({x: 0, y: 0.9500000000000001, z: 0});
      climber.aim.set(0, -1);
      world.simulateTime(0.1);
      world.simulateTime(0.1);
      expect(climber.position).to.eql({x: 0, y: -0.9500000000000001, z: 0});
      climber.climber.speed = 113;
      world.simulateTime(0.1);
      expect(climber.position).to.eql({x: 0, y: -7.550000000000001, z: 0});
    });

    it('should release when reaching bottom of climbable', function() {
      climber.aim.set(0, 1);
      climber.climber.speed = 10;
      climber.position.set(0, 0, 0);
      climbable.position.set(0, 0, 0);
      world.simulateTime(1/60);
      climber.aim.set(0, -1);
      climber.position.set(0, -9.9, 0);
      world.simulateTime(1/60);
      expect(climber.climber.attached).to.be(climbable);
      climber.position.set(0, -10, 0);
      world.simulateTime(1/60);
      expect(climber.climber.attached).to.be(null);
    });

    it('should release when reaching top of climbable', function() {
      climber.aim.set(0, 1);
      climber.climber.speed = 10;
      climber.position.set(0, 0, 0);
      climbable.position.set(0, 0, 0);
      world.simulateTime(1/60);
      expect(climber.climber.attached).to.be(climbable);
      climber.position.set(0, 3.1, 0);
      world.simulateTime(1/60);
      expect(climber.climber.attached).to.be(null);
    });

    context('from top', function() {
      it('should position itself with distance from top', function() {
        climber.aim.set(0, -1);
        climber.position.set(0, 9.9, 0);
        climbable.position.set(0, 0, 0);
        world.simulateTime(1/60);
        expect(climber.position).to.eql({ x: 0, y: 3, z: 0 });
      });
    });
  });

  context('when climber colliding with climbable', function() {
    it('should be ignored when approaching from left', function() {
      climber.aim.set(0, 0);
      climber.position.set(-10, 0, 0);
      climbable.position.set(0, 0, 0);
      climber.velocity.set(10, 0);
      world.simulateTime(0.1);
      expect(climber.position.x).to.be(-9.5);
    });

    it('should be ignored when approaching from right', function() {
      climber.aim.set(0, 0);
      climber.position.set(10, 0, 0);
      climbable.position.set(0, 0, 0);
      climber.velocity.set(-10, 0);
      world.simulateTime(0.1);
      expect(climber.position.x).to.be(9.5);
    });

    it('should be ignored when approaching from bottom', function() {
      climber.aim.set(0, 0);
      climber.position.set(0, -10, 0);
      climbable.position.set(0, 0, 0);
      climber.velocity.set(0, 10);
      world.simulateTime(0.1);
      expect(climber.position.y).to.be(-9.5);
    });

    it('should be obstructed when approaching from above', function() {
      climber.aim.set(0, 0);
      climber.position.set(0, 10, 0);
      climbable.position.set(0, 0, 0);
      climber.velocity.set(0, -10);
      world.simulateTime(.1);
      expect(climber.position.y).to.be(10);
    });
  });
});
