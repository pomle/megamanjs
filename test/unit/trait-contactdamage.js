const expect = require('expect.js');
const sinon = require('sinon');

const Object = require('../../src/engine/Object');
const ContactDamage = require('../../src/engine/traits/ContactDamage');
const Invincibility = require('../../src/engine/traits/Invincibility');
const Health = require('../../src/engine/traits/Health');
const World = require('../../src/engine/World');

describe('ContactDamage Trait', function() {
  it('should expose itself as "contactDamage" on host', function() {
    const player = new Object;
    player.applyTrait(new ContactDamage);
    expect(player.contactDamage).to.be.a(ContactDamage);
  });

  it('should inflict damage on objects with health', function() {
    const eventSpy = sinon.spy();
    const contactDamage = new ContactDamage;

    const player = new Object;
    player.addCollisionRect(10, 10);
    player.applyTrait(new Health);
    player.applyTrait(new Invincibility);
    player.events.bind(contactDamage.EVENT_CONTACT_DAMAGE, eventSpy);
    player.health.energy.max = 25;
    player.health.energy.fill();

    const monster = new Object;
    monster.addCollisionRect(10, 10);
    monster.applyTrait(contactDamage);
    monster.contactDamage.points = 10;

    player.position.set(0, 0, 0);
    monster.position.set(0, 0, 0);

    const world = new World;
    world.addObject(player);
    world.addObject(monster);
    world.simulateTime(0.1);

    expect(player.health.energy.amount).to.be(15);
    expect(eventSpy.called).to.be(true);
  });

  it('should ignore objects without health', function() {
    const eventSpy = sinon.spy();
    const contactDamage = new ContactDamage;

    const player = new Object;
    player.addCollisionRect(10, 10);
    player.events.bind(contactDamage.EVENT_CONTACT_DAMAGE, eventSpy);

    const monster = new Object;
    monster.addCollisionRect(10, 10);
    monster.applyTrait(contactDamage);
    monster.contactDamage.points = 10;

    player.position.set(0, 0, 0);
    monster.position.set(0, 0, 0);

    const world = new World;
    world.addObject(player);
    world.addObject(monster);
    world.simulateTime(0.1);

    expect(eventSpy.called).to.be(false);
  });
});
