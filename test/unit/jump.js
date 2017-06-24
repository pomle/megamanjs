const expect = require('expect.js');
const sinon = require('sinon');

const Entity = require('../../src/engine/Object');
const World = require('../../src/engine/World');
const Physics = require('../../src/engine/traits/Physics');
const Jump = require('../../src/engine/traits/Jump');
const Solid = require('../../src/engine/traits/Solid');

describe('Jump', function() {
  it.skip('should maintain jump height despite variations in time', function() {
    const step = 1/120;

    const world = new World();

    const ground = new Entity();
    ground.applyTrait(new Solid());
    ground.addCollisionRect(1000, 10);
    ground.position.set(0, 0);

    const jumper = new Character();
    jumper.addCollisionRect(10, 10);
    jumper.position.set(0, 30);
    jumper.applyTrait(new Solid());
    jumper.applyTrait(new Physics());
    jumper.physics.mass = 1;
    jumper.applyTrait(new Jump());
    jumper.jump.force.x = 10000;

    world.addObject(jumper);
    world.addObject(ground);

    let maxLoops = 40;
    expect(jumper.jump._ready).to.be(false);
    while (jumper.jump._ready === false && maxLoops--) {
      world.updateTime(step);
    }
    expect(jumper.jump._ready).to.be(true);
    expect(jumper.position.y).to.equal(10);
  });
});
