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
});
