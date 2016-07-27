'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../env.js');
const World = env.Engine.World;
const Object = env.Engine.Object;
const Conveyor = env.Game.traits.Conveyor;
const Physics = env.Game.traits.Physics;
const Solid = env.Game.traits.Solid;

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
