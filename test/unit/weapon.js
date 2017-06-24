const expect = require('expect.js');
const sinon = require('sinon');

const Entity = require('../../src/engine/Object');
const Weapon = require('../../src/engine/object/Weapon');
const Projectile = require('../../src/engine/traits/Projectile');
const WeaponTrait = require('../../src/engine/traits/Weapon');

describe('Weapon', function() {
  let weapon;
  let worldMock;
  let character;

  function createProjectile()
  {
    const proj = new Entity();
    proj.applyTrait(new Projectile);
    return proj;
  }

  beforeEach(function() {
    worldMock = {
      addObject: sinon.spy(function(object) {
        object.world = worldMock;
      }),
      removeObject: sinon.spy(function(object) {
        object.unsetWorld();
      }),
    };
    weapon = new Weapon();
    character = new Entity();
    character.world = worldMock;
    character.applyTrait(new WeaponTrait());
    character.weapon.equip(weapon);
  });

  describe('#fire', function() {
    it('should honor cooldown time if set', function() {
      weapon.setCoolDown(1);
      expect(weapon.fire()).to.be(true);
      weapon.timeShift(.9);
      expect(weapon.fire()).to.be(false);
      weapon.timeShift(.1);
      expect(weapon.fire()).to.be(true);
    });

    it('should ignore cool down if not set', function() {
      weapon.setCoolDown(0);
      expect(weapon.fire()).to.be(true);
      expect(weapon.coolDownDelay).to.be(undefined);
    });

    it('should honor projectile stash', function() {
      const projectile = createProjectile();
      weapon.addProjectile(projectile);
      expect(weapon.fire()).to.be(true);
      weapon.emit(weapon.getProjectile());
      expect(worldMock.addObject.callCount).to.equal(1);
      expect(worldMock.addObject.lastCall.args[0]).to.be(projectile);
      expect(weapon.fire()).to.be(false);
    });

    it('should decrease and honor ammo limit', function() {
      weapon.ammo.max = 10;
      weapon.cost = 1;
      for (let i = 10; i > 0; --i) {
        expect(weapon.fire()).to.be(true);
        expect(weapon.ammo.amount).to.equal(i - 1);
      }
      expect(weapon.fire()).to.be(false);
    });

    it('should trigger ammo change event', function() {
      weapon.ammo.max = 10;
      const callback = sinon.spy();
      weapon.events.bind(weapon.EVENT_AMMO_CHANGED, callback);
      weapon.fire();
      expect(callback.callCount).to.equal(1);
      expect(callback.lastCall.args[0]).to.be(weapon);
    });

    it('should not decrease ammo if infinite', function() {
      weapon.ammo.infinite = true;
      weapon.cost = 1;
      expect(weapon.fire()).to.be(true);
      expect(weapon.ammo.amount).to.equal(100);
      expect(weapon.fire()).to.be(true);
      expect(weapon.ammo.amount).to.equal(100);
    });
  });

  describe('#emit', function() {
    it('should move projectile from idle to fired pool', function() {
      const projectile = createProjectile();
      weapon.addProjectile(projectile);
      weapon.emit(projectile);
      expect(weapon.projectilesIdle).to.have.length(0);
      expect(weapon.projectilesFired).to.have.length(1);
      expect(weapon.projectilesFired[0]).to.be(projectile);
    });

    it('should set projectile speed according to users aim', function() {
      const projectile = createProjectile();
      projectile.projectile.setSpeed(10);

      weapon.directions[0].set(-1, -1);
      weapon.directions[1].set(1, 1);

      weapon.user.aim.set(1, 1);
      weapon.emit(projectile);
      expect(projectile.velocity.x).to.equal(7.071067811865475);
      expect(projectile.velocity.y).to.equal(7.071067811865475);

      weapon.user.aim.set(-1, .5);
      weapon.emit(projectile);
      expect(projectile.velocity.x).to.equal(-8.94427190999916);
      expect(projectile.velocity.y).to.equal(4.47213595499958);
    });

    it('should use user horizontal direction for projectile speed if aim is zero', function() {
      const projectile = createProjectile();
      projectile.projectile.setSpeed(10);
      weapon.user.aim.set(0, 0);
      weapon.user.direction.set(1, 0);
      weapon.emit(projectile);
      expect(projectile.velocity.x).to.equal(10);
      weapon.user.direction.set(-1, 0);
      weapon.emit(projectile);
      expect(projectile.velocity.x).to.equal(-10);
    });

    it('should clamp user aim if weapon aim restricted', function() {
      const projectile = createProjectile();
      projectile.projectile.setSpeed(10);
      weapon.addProjectile(projectile);
      weapon.directions[0].set(-1, 0);
      weapon.directions[1].set(1, 0);
      weapon.user.aim.set(1, 1);
      weapon.emit(projectile);
      expect(projectile.velocity.x).to.equal(10);
      weapon.user.aim.set(1, -1);
      weapon.emit(projectile);
      expect(projectile.velocity.x).to.equal(10);
      weapon.user.aim.set(-1, 1);
      weapon.emit(projectile);
      expect(projectile.velocity.x).to.equal(-10);
      weapon.user.aim.set(-1, -1);
      weapon.emit(projectile);
      expect(projectile.velocity.x).to.equal(-10);
    });

    it('should copy user time stretch to projectile', function() {
      const projectile = createProjectile();
      weapon.user.timeStretch = 1.12451;
      weapon.emit(projectile);
      expect(projectile.timeStretch).to.equal(1.12451);
    });

    it('should set emitter on projectile to weapon user', function() {
      const projectile = createProjectile();
      weapon.emit(projectile);
      expect(projectile.emitter).to.be(weapon.user);
    });
  });

  describe('#addProjectile', function() {
    it('should add projectile to projectiles list', function() {
      const projectile = createProjectile();
      weapon.addProjectile(projectile);
      expect(weapon.projectiles).to.have.length(1);
      expect(weapon.projectiles[0]).to.be(projectile);
      expect(weapon.projectilesIdle).to.have.length(1);
      expect(weapon.projectilesIdle[0]).to.be(projectile);
      expect(weapon.projectilesFired).to.have.length(0);
    });
  });

  describe('#recycleProjectile', function() {
    it('should move projectile from fired to idle pool and remove from world', function() {
      const projectile = createProjectile();
      weapon.addProjectile(projectile);
      weapon.emit(projectile);
      weapon.recycleProjectile(projectile);
      expect(weapon.projectilesIdle).to.have.length(1);
      expect(weapon.projectilesIdle[0]).to.be(projectile);
      expect(weapon.projectilesFired).to.have.length(0);
      expect(worldMock.removeObject.calledOnce).to.be(true);
      expect(worldMock.removeObject.lastCall.args[0]).to.be(projectile);
    });

    it('should remove projectile from world', function() {
      const projectile = createProjectile();
      weapon.addProjectile(projectile);
      weapon.emit(projectile);
      weapon.recycleProjectile(projectile);
      expect(worldMock.removeObject.callCount).to.equal(1);
      expect(worldMock.removeObject.lastCall.args[0]).to.be(projectile);
    });
  });

  describe('#setUser', function() {
    it('should except if user not object', function() {
      expect(function() {
        weapon.setUser('');
      }).to.throwError(function(error) {
        expect(error).to.be.a(TypeError);
        expect(error.message).to.equal('User not object');
      });
    });

    it('should except if user weapon trait not applied', function() {
      expect(function() {
        weapon.setUser(new Entity());
      }).to.throwError(function(error) {
        expect(error).to.be.a(TypeError);
        expect(error.message).to.equal('User missing weapon trait');
      });
    });
  });
});
