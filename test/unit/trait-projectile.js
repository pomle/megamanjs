const expect = require('expect.js');
const sinon = require('sinon');

const Object = require('../../src/engine/Object');
const Health = require('../../src/engine/traits/Health');
const Projectile = require('../../src/engine/traits/Projectile');

describe('Projectile Trait', function() {
  function createCharacter()
  {
    const host = new Object;
    host.applyTrait(new Health);
    return host;
  }

  function createProjectile()
  {
    const host = new Object;
    host.applyTrait(new Projectile);
    return host;
  }

  it('should recycle when range reached', function() {
    const proj = createProjectile();
    proj.projectile.setRange(8.603);
    proj.projectile.setOrigin({x: 0, y: 0, z: 0});
    proj.position.set(0, 0, 0);
    sinon.stub(proj.projectile, 'recycle');
    proj.timeShift(.1);
    expect(proj.projectile.recycle.called).to.be(false);
    proj.position.set(7, 5, 0);
    proj.timeShift(.1);
    expect(proj.projectile.recycle.called).to.be(false);
    proj.position.set(7.5, 5, 0);
    proj.timeShift(.1);
    expect(proj.projectile.recycle.called).to.be(true);
  });

  it('should make host collidable when reset', function() {
    const proj = createProjectile();
    proj.collidable = false;
    proj.reset();
    expect(proj.collidable).to.be(true);
  });

  context('when colliding with object without health', function() {
    it('should be inert', function() {
      const char = new Object;
      const proj = createProjectile();
      proj.projectile.setDamage(13);
      proj.collides(char);
    });
  });

  context('when colliding with object with health', function() {
    it('should inflict correct amount of damage', function() {
      const char = createCharacter();
      const proj = createProjectile();
      char.health.energy.max = 27;
      char.health.energy.fill();
      proj.projectile.setDamage(13);
      proj.collides(char);
      expect(char.health.energy.amount).to.be(14);
    });
    it('should ignore if subject is emitter', function() {
      const char = createCharacter();
      const proj = createProjectile();
      char.health.energy.max = 27;
      char.health.energy.fill();
      proj.setEmitter(char);
      proj.projectile.setDamage(13);
      proj.collides(char);
      expect(char.health.energy.amount).to.be(27);
    });
    it('should calculate and supply direction', function() {
      const char = createCharacter();
      const proj = createProjectile();
      char.position.set(-1.13, 3.35, 0);
      proj.position.set(2.41, 1.15, 0);
      sinon.stub(char.health, 'inflictDamage');
      proj.collides(char);
      expect(char.health.inflictDamage.lastCall.args[1]).to.eql({ x: 3.54, y: -2.2, z: 0 });
    });
    context('and projectile has penetrating property', function() {
      it('should recyle if health not depleted', function() {
        const char = createCharacter();
        const proj = createProjectile();
        char.health.energy.max = 10;
        char.health.energy.fill();
        proj.projectile.setDamage(5);
        proj.projectile.penetratingForce = true;
        sinon.stub(proj.projectile, 'recycle');
        proj.collides(char);
        expect(proj.projectile.recycle.calledOnce).to.be(true);
      });
      it('should recyle if health is depleted', function() {
        const char = createCharacter();
        const proj = createProjectile();
        char.health.energy.max = 10;
        char.health.energy.fill();
        proj.projectile.setDamage(15);
        proj.projectile.penetratingForce = true;
        sinon.stub(proj.projectile, 'recycle');
        proj.collides(char);
        expect(proj.projectile.recycle.called).to.be(false);
      });
    });
    context('and projectile does not have penetrating property', function() {
      it('should recyle even if health depleted', function() {
        const char = createCharacter();
        const proj = createProjectile();
        char.health.energy.max = 10;
        char.health.energy.fill();
        proj.projectile.setDamage(12);
        proj.projectile.penetratingForce = false;
        sinon.stub(proj.projectile, 'recycle');
        proj.collides(char);
        expect(proj.projectile.recycle.calledOnce).to.be(true);
      });
    });
  });

  context('when recycle event emitted on host', function() {
    it('should recycle', function() {
      const proj = createProjectile();
      sinon.stub(proj.projectile, 'recycle');
      proj.events.trigger(proj.projectile.EVENT_RECYCLE);
      expect(proj.projectile.recycle.calledOnce).to.be(true);
    });
  });

  describe('#deflect()', function() {
    it('should change direction and maintain speed', function() {
      const proj = createProjectile();
      proj.velocity.set(100, 0, 0);
      proj.projectile.deflect();
      expect(proj.velocity).to.eql({x: -70.71067811865474, y: 70.71067811865474});
      expect(proj.velocity.length()).to.be.within(99.9999999, 100.0000001);
    });
  });

  describe('#recycle()', function() {
    it('should emit recycled event', function() {
      const proj = createProjectile();
      const callSpy = sinon.spy();
      proj.events.bind(proj.projectile.EVENT_RECYCLED, callSpy);
      proj.projectile.recycle();
      expect(callSpy.calledOnce).to.be(true);
    });
  });
});
