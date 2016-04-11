var expect = require('expect.js');
var sinon = require('sinon');

var env = require('../../env.js');

var Obj = env.Engine.Object;
var World = env.Engine.World;
var Character = env.Game.objects.Character;
var Physics = env.Game.traits.Physics;
var Jump = env.Game.traits.Jump;
var Solid = env.Game.traits.Solid;

describe('Jump', function() {
  it.skip('should maintain jump height despite variations in time', function() {
    var step = 1/120;

    var world = new World();

    var ground = new Obj();
    ground.applyTrait(new Solid());
    ground.addCollisionRect(1000, 10);
    ground.position.set(0, 0);

    var jumper = new Character();
    jumper.addCollisionRect(10, 10);
    jumper.position.set(0, 30);
    jumper.applyTrait(new Solid());
    jumper.applyTrait(new Physics());
    jumper.physics.mass = 1;
    jumper.applyTrait(new Jump());
    jumper.jump.force.x = 10000;

    world.addObject(jumper);
    world.addObject(ground);

    var maxLoops = 40;
    expect(jumper.isSupported).to.be(false);
    while (jumper.isSupported === false && maxLoops--) {
      world.updateTime(step);
    }
    expect(jumper.isSupported).to.be(true);
    expect(jumper.position.y).to.equal(10);
  });
});
