const expect = require('expect.js');
const sinon = require('sinon');

const Object = require('../../src/engine/Object');
const World = require('../../src/engine/World');
const Conveyor = require('../../src/engine/traits/Conveyor');
const Physics = require('../../src/engine/traits/Physics');
const Solid = require('../../src/engine/traits/Solid');

describe('Conveyor Trait', function() {
  function createCharacter()
  {
    const host = new Object;
    host.addCollisionRect(10, 10);
    host.applyTrait(new Solid);
    return host;
  }

  function createConveyor()
  {
    const host = new Object;
    host.addCollisionRect(100, 10);
    host.applyTrait(new Conveyor);
    return host;
  }

  it('should obstruct and set velocity on solid objects colliding from above', function() {
    const conveyor = createConveyor();
    const character = createCharacter();
    const world = new World;
    conveyor.position.set(0, 0, 0);
    character.position.set(0, 9, 0);
    character.velocity.set(0, -20);
    world.addObject(conveyor);
    world.addObject(character);
    world.simulateTime(.5);
    expect(character.position).to.eql({x: 0, y: 10, z: 0});
    expect(character.velocity).to.eql({x: 40, y: 0});
  });

  it('should only obstruct solid colliding from below', function() {
    const conveyor = createConveyor();
    const character = createCharacter();
    const world = new World;
    conveyor.position.set(0, 0, 0);
    character.position.set(0, -9, 0);
    character.velocity.set(0, 20);
    world.addObject(conveyor);
    world.addObject(character);
    world.simulateTime(.5);
    expect(character.position).to.eql({x: 0, y: -10, z: 0});
    expect(character.velocity).to.eql({x: 0, y: 20});
  });

  describe('#swapDirection()', function() {
    it('should negate host direction x', function() {
      const conveyor = createConveyor();
      conveyor.direction.x = 1;
      conveyor.conveyor.swapDirection();
      expect(conveyor.direction.x).to.be(-1);
    });

    it('should negate velocity', function() {
      const conveyor = createConveyor();
      conveyor.conveyor.velocity.x = 40;
      conveyor.conveyor.swapDirection();
      expect(conveyor.conveyor.velocity.x).to.be(-40);
    });
  });
});
