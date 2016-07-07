'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env');
const Object = env.Engine.Object;
const Conveyor = env.Game.traits.Conveyor;

describe('Conveyor Trait', function() {
  function createConveyor()
  {
    const host = new Object;
    host.addCollisionRect(100, 10);
    host.applyTrait(new Conveyor);
    return host;
  }

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
