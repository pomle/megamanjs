var expect = require('expect.js');
var sinon = require('sinon');

var env = require('../../env.js');

var World = env.Engine.World;
var Spawnable = env.Engine.Object;
var Spawner = env.Game.objects.Spawner;

describe('Spawner', function() {
  context('on instantiation', function() {
    var spawner = new Spawner();
    it('should have a max and min distance set', function() {
      expect(spawner.maxDistance).to.be.a('number');
      expect(spawner.minDistance).to.be.a('number');
    });
    it('should have an empty children array', function() {
      expect(spawner.children).to.be.an(Array);
      expect(spawner.children).to.have.length(0);
    });
    it('should have interval set to 0', function() {
      expect(spawner.interval).to.be(0);
    });
    it('should have count set to infinity', function() {
      expect(spawner.count).to.be(Infinity);
    });
    it('should have an undefined lifetime', function() {
      expect(spawner.lifetime).to.be(undefined);
    });
    it('should have max simultaneous spawns set to 1', function() {
      expect(spawner.maxSimultaneousSpawns).to.be(1);
    });
    it('should have empty spawn count', function() {
      expect(spawner.spawns).to.be(0);
    });
    it('should have an undefined roaming limit', function() {
      expect(spawner.roamingLimit).to.be(undefined);
    });
  });
  describe('#cleanReferences', function() {
    var world = new World();
    var spawner = new Spawner();
    spawner.pool.push(Spawnable);
    world.addObject(spawner);
    it('should remove children that are no longer in world', function() {
      spawner.spawnObject();
      expect(spawner.children).to.have.length(1);
      expect(world.objects[1]).to.be(spawner.children[0]);
      world.removeObject(spawner.children[0]);
      spawner.cleanReferences();
      expect(spawner.children).to.have.length(0);
    });
  });
  context('when active', function() {
    var world = new World();
    var spawner = new Spawner();
    spawner.pool.push(Spawnable);
    spawner.minDistance = 0;
    spawner.maxDistance = 0;
    spawner.maxSimultaneousSpawns = 1;
    spawner.interval = 1;
    world.addObject(spawner);
    world.addObject = sinon.spy(world.addObject);
    it('should spawn from pool after interval is met', function() {
      world.updateTime(.5);
      expect(spawner._timeSinceLastSpawn).to.be(.5);
      expect(world.objects).to.have.length(1);
      world.updateTime(.5);
      expect(spawner._timeSinceLastSpawn).to.be(0);
      expect(world.objects).to.have.length(2);
      expect(world.objects[1]).to.be.a(Spawnable);
      expect(world.addObject.callCount).to.be(1);
    });
    it('should spawn object as position of spawner', function() {
      expect(spawner.children[0].position).to.eql(spawner.position);
    });
    it('should increase spawn count', function() {
      expect(spawner.spawns).to.be(1);
    });
    it('should not spawn another one as long as child in world', function() {
      world.updateTime(5);
      expect(world.objects).to.have.length(2);
      world.removeObject(world.objects[1]);
      world.updateTime(.1);
      expect(world.addObject.callCount).to.be(2);
    });
    it('should honor max simultaneous spawns', function() {
      spawner.maxSimultaneousSpawns = 5;
      expect(world.objects).to.have.length(2);
      world.updateTime(1);
      expect(world.objects).to.have.length(3);
      world.updateTime(1);
      expect(world.objects).to.have.length(4);
      world.updateTime(1);
      expect(world.objects).to.have.length(5);
      world.updateTime(1);
      expect(world.objects).to.have.length(6);
      world.updateTime(1);
      expect(world.objects).to.have.length(6);
    });
  });
});
