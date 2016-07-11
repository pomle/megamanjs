'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env');
const World = env.Engine.World;
const Object = env.Engine.Object;
const Elevator = env.Game.traits.Elevator;
const Physics = env.Game.traits.Physics;
const Solid = env.Game.traits.Solid;
const Vec2 = env.THREE.Vector2;

describe('Elevator Trait', function() {
  function createCharacter()
  {
    const char = new Object;
    char.addCollisionRect(10, 10);
    char.applyTrait(new Solid);
    char.applyTrait(new Physics);
    char.physics.mass = 1;
    return char;
  }

  function createElevator()
  {
    const host = new Object;
    host.addCollisionRect(10, 10);
    host.applyTrait(new Elevator);
    return host;
  }

  it('should expose elevator property on host', function() {
    const elevator = createElevator();
    expect(elevator.elevator).to.be.an(Elevator);
  });

  it('should move host when time updated', function() {
      const elevator = createElevator();
      elevator.elevator.speed = 10;
      elevator.elevator.addNode(new Vec2(50, 0));
      elevator.timeShift(1);
      expect(elevator.position).to.eql({x: 10, y: 0, z: 0});
      elevator.timeShift(2);
      expect(elevator.position).to.eql({x: 30, y: 0, z: 0});
  });

  it('should honor speed', function() {
      const elevator = createElevator();
      elevator.elevator.speed = 20;
      elevator.elevator.addNode(new Vec2(50, 0));
      elevator.timeShift(1);
      expect(elevator.position).to.eql({x: 20, y: 0, z: 0});
  });

  it('should support speed change during operation', function() {
      const elevator = createElevator();
      elevator.elevator.addNode(new Vec2(50, 0));
      elevator.elevator.speed = 10;
      elevator.timeShift(1);
      expect(elevator.position).to.eql({x: 10, y: 0, z: 0});
      elevator.elevator.speed = 20;
      elevator.timeShift(1);
      expect(elevator.position).to.eql({x: 30, y: 0, z: 0});
  });

  it('should loop around when end reached', function() {
      const elevator = createElevator();
      elevator.elevator.speed = 10;
      elevator.elevator.addNode(new Vec2(50, 0));
      elevator.elevator.addNode(new Vec2(0, 50));
      elevator.elevator.addNode(new Vec2(-50, -50));
      elevator.timeShift(10);
      expect(elevator.position).to.eql({x: 50, y: 50, z: 0});
      elevator.timeShift(8);
      expect(elevator.position).to.eql({x: 9.289321881345245, y: 0, z: 0});
  });

  it('should support an object coming from above', function() {
    const elevator = createElevator();
    elevator.elevator.addNode(new Vec2(0, 10));
    elevator.elevator.speed = 0;
    elevator.position.set(0, 0, 0);

    const character = createCharacter();
    character.position.set(0, 11, 0);

    const world = new World;
    world.gravityForce.set(0, 10);
    world.addObject(elevator);
    world.addObject(character);

    world.updateTime(1/20);
    expect(character.position).to.eql({x: 0, y: 10, z: 0});
  });

  it('should ignore an object coming from below', function() {
    const elevator = createElevator();
    elevator.elevator.addNode(new Vec2(0, 0));
    elevator.elevator.speed = 0;
    elevator.position.set(0, 0, 0);

    const character = createCharacter();
    character.position.set(0, -10, 0);

    const world = new World;
    world.gravityForce.set(0, -10);
    world.addObject(elevator);
    world.addObject(character);

    world.updateTime(1/20);
    expect(character.position).to.eql({x: 0, y: -8.56729404634543, z: 0});
  });

  it('should move an object standing on it', function() {
    const elevator = createElevator();
    elevator.elevator.addNode(new Vec2(10, 0));
    elevator.elevator.addNode(new Vec2(-10, 0));
    elevator.elevator.speed = 10;
    elevator.position.set(0, 0, 0);

    const character = createCharacter();
    character.position.set(0, 10, 0);

    const world = new World;
    world.gravityForce.set(0, 10);
    world.addObject(elevator);
    world.addObject(character);

    world.updateTime(1/2);
    expect(character.position.x).to.be.within(4.5, 5);
    expect(character.position.y).to.be(10);
  });
});
