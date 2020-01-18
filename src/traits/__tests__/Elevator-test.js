const expect = require('expect.js');
const sinon = require('sinon');

const {Vector2: Vec2} = require('three');
const {Entity, World} = require('@snakesilk/engine');
const {Physics, Solid} = require('@snakesilk/platform-traits');

const Elevator = require('../Elevator');

describe('Elevator Trait', function() {
  function createCharacter()
  {
    const char = new Entity();
    char.addCollisionRect(10, 10);
    char.applyTrait(new Solid);
    char.applyTrait(new Physics);
    char.physics.mass = 1;
    return char;
  }

  function createElevator()
  {
    const host = new Entity();
    host.addCollisionRect(10, 10);
    host.applyTrait(new Elevator);
    return host;
  }

  it('should have a speed property', function() {
    const elevator = new Elevator;
    expect(elevator.speed).to.be.a('number');
  });

  describe('#getOffset', function() {
    it('should find position at a given distance', function() {
      const elevator = new Elevator;
      elevator.addNode(new Vec2(120, 0));
      elevator.addNode(new Vec2(0, 60));
      expect(elevator.getOffset(60)).to.eql({x: 60, y: 0});
      expect(elevator.getOffset(130)).to.eql({x: 120, y: 10});
    });

    it('should start from beginning if distance higher than sum of nodes', function() {
      const elevator = new Elevator;
      elevator.addNode(new Vec2(120, 0));
      elevator.addNode(new Vec2(0, 60));
      expect(elevator.getOffset(180 + 150)).to.eql({x: 120, y: 30});
      expect(elevator.getOffset(180 * 5000 + 150)).to.eql({x: 120, y: 30});
    });
  });

  it('should expose elevator property on host', function() {
    const elevator = createElevator();
    expect(elevator.elevator).to.be.an(Elevator);
  });

  it('should move host when time updated', function() {
      const elevator = createElevator();
      elevator.elevator.speed = 10;
      elevator.elevator.addNode(new Vec2(50, 0));
      elevator.timeShift(1);
      expect(elevator.position).to.eql({x: 5, y: 0, z: 0});
      elevator.timeShift(2);
      expect(elevator.position).to.eql({x: 30, y: 0, z: 0});
  });

  it('should honor speed', function() {
      const elevator = createElevator();
      elevator.elevator.speed = 20;
      elevator.elevator.addNode(new Vec2(50, 0));
      elevator.timeShift(1);
      expect(elevator.position).to.eql({x: 10, y: 0, z: 0});
  });

  it('should support speed change during operation', function() {
      const elevator = createElevator();
      elevator.elevator.addNode(new Vec2(50, 0));
      elevator.elevator.speed = 10;
      elevator.timeShift(1);
      expect(elevator.position).to.eql({x: 5, y: 0, z: 0});
      elevator.elevator.speed = 20;
      elevator.timeShift(1);
      expect(elevator.position).to.eql({x: 25, y: 0, z: 0});
  });

  it('should loop around when end reached', function() {
      const elevator = createElevator();
      elevator.elevator.speed = 25;
      elevator.elevator.addNode(new Vec2(5, 0));
      elevator.elevator.addNode(new Vec2(0, 5));
      elevator.elevator.addNode(new Vec2(-5, -5));
      const world = new World;
      world.addObject(elevator);
      world.updateTime(1);
      expect(elevator.position).to.eql({x: 5, y: 2.9289321881344925, z: 0});
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

  it('should move an object resting on it when travelling left', function() {
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

  it('should move an object resting on it when travelling right', function() {
    const elevator = createElevator();
    elevator.elevator.addNode(new Vec2(-10, 0));
    elevator.elevator.addNode(new Vec2(10, 0));
    elevator.elevator.speed = 10;
    elevator.position.set(0, 0, 0);

    const character = createCharacter();
    character.position.set(0, 10, 0);

    const world = new World;
    world.gravityForce.set(0, 10);
    world.addObject(elevator);
    world.addObject(character);

    world.updateTime(1/2);
    expect(character.position.x).to.be.within(-5, -4.5);
    expect(character.position.y).to.be(10);
  });

  it('should move an object standing on it when travelling up', function() {
    const elevator = createElevator();
    elevator.elevator.addNode(new Vec2(0, 0));
    elevator.elevator.addNode(new Vec2(0, 100));
    elevator.elevator.speed = 50;
    elevator.position.set(0, 0, 0);

    const character = createCharacter();
    character.position.set(0, 10, 0);

    const world = new World;
    world.gravityForce.set(0, 10);
    world.addObject(elevator);
    world.addObject(character);

    world.updateTime(1);
    expect(character.position.y).to.be.within(59.9999999, 60);
  });
});
