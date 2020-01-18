const expect = require('expect.js');
const sinon = require('sinon');

const {Entity, World} = require('@snakesilk/engine');
const {ContactDamage, Health, Jump, Move, Physics, Solid} = require('@snakesilk/platform-traits');

const Stun = require('../Stun');

describe('Stun Trait', function() {
  function createGround()
  {
    const ground = new Entity();
    ground.addCollisionRect(200, 10);
    ground.applyTrait(new Solid);
    ground.solid.fixed = true;
    ground.solid.obstructs = true;
    return ground;
  }

  function createHostile()
  {
    const host = new Entity();
    host.addCollisionRect(10, 10);
    host.applyTrait(new ContactDamage);
    host.contactDamage.points = 1;
    return host;
  }

  function createPlayer()
  {
    const host = new Entity();
    host.addCollisionRect(10, 10);
    host.applyTrait(new Physics);
    host.applyTrait(new Solid);
    host.applyTrait(new Health);
    host.applyTrait(new Stun);
    host.applyTrait(new Jump);
    host.applyTrait(new Move);
    host.physics.mass = 10;
    host.health.energy.max = 25;
    host.health.energy.fill();
    return host;
  }

  context('when host is inflicted with damage', function() {
    it('should inhibit move', function() {
      const player = createPlayer();
      player.stun.force = 0;
      player.health.inflictDamage(10);
      player.aim.x = 1;
      const world = new World;
      world.gravityForce.set(0, 0);
      world.addObject(player);
      world.simulateTime(1);
      expect(player.position).to.eql({x: 0, y: 0, z: 0});
    });

    it('should inhibit jump', function() {
      const player = createPlayer();
      player.stun.force = 0;
      player.health.inflictDamage(10);
      player.jump.reset();
      player.jump.engage();
      const world = new World;
      world.gravityForce.set(0, 0);
      world.addObject(player);
      world.simulateTime(1);
      expect(player.position).to.eql({x: 0, y: 0, z: 0});
    });
  });

  context('when colliding with hostile', function() {
    it('should bump left when colliding from right', function() {
      const player = createPlayer();
      const hostile = createHostile();

      player.stun.force = 200;
      player.position.set(0, 0, 0);
      hostile.position.set(9, 0, 0);

      const world = new World;
      world.addObject(player);
      world.addObject(hostile);
      world.updateTime(1/30);

      expect(player.velocity).to.eql({x: -8.926649296332, y: -11.548318135759386});
    });
    it('should bump left when colliding from right', function() {
      const player = createPlayer();
      const hostile = createHostile();

      player.stun.force = 150;
      player.position.set(0, 0, 0);
      hostile.position.set(-9, 0, 0);

      const world = new World;
      world.addObject(player);
      world.addObject(hostile);
      world.updateTime(1/30);

      expect(player.velocity).to.eql({x: 6.6982887682631, y: -16.010781182171428});
    });
  });

  context('when engaged', function() {
    it('should bump host every obstructed by ground', function() {
      const player = createPlayer();
      const ground = createGround();
      const hostile = createHostile();

      player.physics.mass = 1;
      player.stun.force = 1500;
      player.position.set(0, 10, 0);
      ground.position.set(0, 0, 0);
      hostile.position.set(-9, 10, 0);

      const world = new World;
      world.addObject(ground);
      world.addObject(player);
      world.addObject(hostile);
      const measures = [];
      world.doFor(2, elapsed => {
        const s = player.position.clone()
        measures.push(s);
      });
      world.updateTime(1.5);
      expect(measures[0].y).to.be(10);
      expect(measures[2].y).to.be(18.45873899222579);
      expect(measures[7].y).to.be(10);
      expect(measures[20].y).to.be(17.58171466950625);
    });
  });
});
