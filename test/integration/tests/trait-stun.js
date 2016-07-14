'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env');
const World = env.Engine.World;
const Object = env.Engine.Object;
const ContactDamage = env.Game.traits.ContactDamage;
const Physics = env.Game.traits.Physics;
const Solid = env.Game.traits.Solid;
const Move = env.Game.traits.Move;
const Jump = env.Game.traits.Jump;
const Health = env.Game.traits.Health;
const Stun = env.Game.traits.Stun;

describe('Stun Trait', function() {
  function createGround()
  {
    const ground = new Object;
    ground.addCollisionRect(200, 10);
    ground.applyTrait(new Solid);
    ground.solid.fixed = true;
    ground.solid.obstructs = true;
    return ground;
  }

  function createHostile()
  {
    const host = new Object;
    host.addCollisionRect(10, 10);
    host.applyTrait(new ContactDamage);
    host.contactDamage.points = 1;
    return host;
  }

  function createPlayer()
  {
    const host = new Object;
    host.addCollisionRect(10, 10);
    host.applyTrait(new Physics);
    host.applyTrait(new Solid);
    host.applyTrait(new Health);
    host.applyTrait(new Stun);
    host.applyTrait(new Jump);
    host.applyTrait(new Move);
    host.physics.mass = 10;
    host.health.max = 25;
    host.health.fill();
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
