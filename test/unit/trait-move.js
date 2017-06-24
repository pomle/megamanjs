const expect = require('expect.js');
const sinon = require('sinon');

const Object = require('../../src/engine/Object');
const World = require('../../src/engine/World');
const Move = require('../../src/engine/traits/Move');

describe('Move Trait', function() {
  function createPlayer()
  {
    const host = new Object;
    host.addCollisionRect(10, 10);
    host.applyTrait(new Move);
    return host;
  }

  it('should move host right when aiming right', function() {
    const player = createPlayer();
    player.aim.x = 1;
    player.move.speed = 90;

    const world = new World;
    world.addObject(player);

    world.simulateTime(1);
    expect(player.position).to.eql({x: 45, y: 0, z: 0});
  });

  it('should move host left when aiming left', function() {
    const player = createPlayer();
    player.aim.x = -1;
    player.move.speed = 113;

    const world = new World;
    world.addObject(player);

    world.simulateTime(1);
    expect(player.position).to.eql({x: -56.5, y: 0, z: 0});
  });

  it('should not move host when disabled', function() {
    const player = createPlayer();
    player.aim.x = -1;
    player.move.speed = 113;
    player.move.disable();

    const world = new World;
    world.addObject(player);

    world.simulateTime(1);
    expect(player.position).to.eql({x: 0, y: 0, z: 0});
  });
});
