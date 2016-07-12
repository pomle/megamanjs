'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env');
const Elevator = env.Game.traits.Elevator;
const Vec2 = env.THREE.Vector2;

describe('Elevator Trait', function() {
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
});
