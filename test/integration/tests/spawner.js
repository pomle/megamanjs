'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env');

const World = env.Engine.World;
const Object = env.Engine.Object;
const Health = env.Game.traits.Health;
const Spawner = env.Game.objects.Spawner;

describe('Spawner', function() {
  class Spawnable extends Object {
    constructor()
    {
      super();
      this.applyTrait(new Health);
    }
  }

  it('should spawn an object from pool when interval reached', function() {
    const spawner = new Spawner;
    spawner.interval = 1.1337;
    spawner.pool.push(Spawnable);
    const world = new World;
    world.addObject(spawner);
    world.simulateTime(1.1336);
    expect(world.objects).to.have.length(1);
    world.simulateTime(0.00011);
    expect(world.objects).to.have.length(2);
    expect(world.objects[1]).to.be.an(Object);
  });

  it('should spawn object at position of spawner', function() {
    const spawner = new Spawner;
    spawner.position.set(13, 17, 19);
    spawner.interval = 1;
    spawner.pool.push(Spawnable);
    const world = new World;
    world.addObject(spawner);
    world.simulateTime(1);
    expect(spawner.getChildren()[0].position).to.eql({x: 13, y: 17, z: 0});
  });

  it('should honor player minDistance', function() {
    const spawner = new Spawner;
    spawner.position.set(0, 0, 0);
    spawner.interval = 1;
    spawner.minDistance = 20;
    spawner.pool.push(Spawnable);

    const player = new Object;
    player.position.set(19, 0, 0);
    player.isPlayer = true;

    const world = new World;
    world.addObject(player);
    world.addObject(spawner);
    world.simulateTime(1);
    expect(spawner.getChildren()).to.have.length(0);
    player.position.set(20, 0, 0);
    world.simulateTime(1);
    expect(spawner.getChildren()).to.have.length(1);
  });

  it('should honor player maxDistance', function() {
    const spawner = new Spawner;
    spawner.position.set(0, 0, 0);
    spawner.interval = 1;
    spawner.maxDistance = 100;
    spawner.pool.push(Spawnable);

    const player = new Object;
    player.position.set(101, 0, 0);
    player.isPlayer = true;

    const world = new World;
    world.addObject(player);
    world.addObject(spawner);
    world.simulateTime(1);
    expect(spawner.getChildren()).to.have.length(0);
    player.position.set(100, 0, 0);
    world.simulateTime(1);
    expect(spawner.getChildren()).to.have.length(1);
  });

  it('should honor max simultaneous spawns', function() {
    const spawner = new Spawner;
    spawner.interval = 1;
    spawner.maxSimultaneousSpawns = 13;
    spawner.pool.push(Spawnable);
    const world = new World;
    world.addObject(spawner);
    world.simulateTime(20);
    expect(spawner.getChildren()).to.have.length(13);
    world.simulateTime(20);
    expect(spawner.getChildren()).to.have.length(13);
    spawner.getChildren().slice(4).forEach(child => {
      world.removeObject(child);
    });
    world.simulateTime(0);
    expect(spawner.getChildren()).to.have.length(13);
    world.simulateTime(20);
    expect(spawner.getChildren()).to.have.length(13);
  });

  it('should honor interval', function() {
    const spawner = new Spawner;
    spawner.maxSimultaneousSpawns = Infinity;
    spawner.interval = 1;
    spawner.pool.push(Spawnable);

    const world = new World;
    world.addObject(spawner);
    world.simulateTime(10);
    expect(spawner.getChildren()).to.have.length(10);

    spawner.reset();
    spawner.interval = 5;
    world.simulateTime(10);
    expect(spawner.getChildren()).to.have.length(2);
  });

  it('should honor max total spawns', function() {
    const spawner = new Spawner;
    spawner.maxSimultaneousSpawns = Infinity;
    spawner.maxTotalSpawns = 3;
    spawner.interval = 1;
    spawner.pool.push(Spawnable);

    const world = new World;
    world.addObject(spawner);
    world.simulateTime(3);
    expect(spawner.getChildren()).to.have.length(3);

    spawner.getChildren().forEach(child => {
      world.removeObject(child);
    });

    world.simulateTime(3);
    expect(spawner.getChildren()).to.have.length(0);
  });

  it('should honor roaming limit', function() {
    const spawner = new Spawner;
    spawner.roamingLimit = 100;
    spawner.maxSimultaneousSpawns = 3;
    spawner.interval = 1;
    spawner.pool.push(Spawnable);

    const world = new World;
    world.addObject(spawner);
    world.simulateTime(3);

    let children = spawner.getChildren();
    expect(children).to.have.length(3);
    children[0].position.set(101, 0, 0);
    children[1].position.set(0, 101, 0);
    world.simulateTime(0);
    expect(spawner.getChildren()).to.have.length(1);
    children[2].position.set(72, 72, 0);
    world.simulateTime(0);
    expect(spawner.getChildren()).to.have.length(0);
  });

  describe('#reset()', function() {
    it('should remove all children', function() {
      const spawner = new Spawner;
      spawner.maxSimultaneousSpawns = Infinity;
      spawner.interval = 1/60;
      spawner.pool.push(Spawnable);
      const world = new World;
      world.addObject(spawner);
      world.simulateTime(.2);
      const children = new Set(spawner.getChildren());
      children.forEach(child => {
        expect(world.hasObject(child)).to.be(true);
      });
      spawner.reset();
      children.forEach(child => {
        expect(world.hasObject(child)).to.be(false);
      });
    });

    it('should reset spawn max limit', function() {
      const spawner = new Spawner;
      spawner.maxSimultaneousSpawns = 1;
      spawner.interval = 1;
      spawner.pool.push(Spawnable);
      const world = new World;
      world.addObject(spawner);
      world.simulateTime(1);
      expect(spawner.getChildren()).to.have.length(1);
      world.simulateTime(5);
      expect(spawner.getChildren()).to.have.length(1);
      spawner.reset();
      world.simulateTime(1);
      expect(spawner.getChildren()).to.have.length(1);
    });

    it('should reset interval counter', function() {
      const spawner = new Spawner;
      spawner.maxSimultaneousSpawns = 2;
      spawner.interval = 1;
      spawner.pool.push(Spawnable);
      const world = new World;
      world.addObject(spawner);
      world.simulateTime(0.9);
      expect(spawner.getChildren()).to.have.length(0);
      world.simulateTime(0.1);
      expect(spawner.getChildren()).to.have.length(1);
      spawner.reset();
      world.simulateTime(0.9);
      expect(spawner.getChildren()).to.have.length(0);
      spawner.reset();
      world.simulateTime(0.9);
      expect(spawner.getChildren()).to.have.length(0);
    });
  });
});
