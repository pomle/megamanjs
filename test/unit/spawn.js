const expect = require('expect.js');
const sinon = require('sinon');

const THREE = require('three');
const World = require('../../src/engine/World');
const Host = require('../../src/engine/Object');
const Spawnable = Host;
const Spawn = require('../../src/engine/traits/Spawn');

describe('Trait', function() {
  describe('Spawn', function() {
    console.log(Host);
    const spawn = new Spawn();
    const world = new World();
    const host = new Host();
    context('when instantiating', function() {
      it('should have name', function() {
        expect(spawn.NAME).to.be('spawn');
      });
    });
    context('when calling addItem()', function() {
      it('should add a condition to conditions array without supplied offset', function() {
        spawn.addItem('recycle', Spawnable);
        expect(spawn._conditions).to.have.length(1);
        const cond = spawn._conditions[0];
        expect(cond.event).to.be('recycle');
        expect(cond.callback).to.be.a('function');
      });
      it('should add a condition to conditions array with supplied offset', function() {
        spawn.addItem('death', Spawnable, new THREE.Vector3(13, 19));
        expect(spawn._conditions).to.have.length(2);
      });
    });
    context('when applying to host', function() {
      it('should bind callback to event', function() {
        host.applyTrait(spawn);
        expect(host.events.bound('recycle', spawn._conditions[0].callback)).to.be(true);
      });
    });
    context('when bound event triggered', function() {
      it('should add an instance in host world', function() {
        world.addObject(host);
        const spy = sinon.spy(world, 'addObject');
        host.events.trigger('recycle');
        expect(spy.callCount).to.be(1);
        expect(spy.lastCall.args[0]).to.be.a(Spawnable);
        expect(world.objects[1].position).to.eql({x: 0, y: 0, z: 0});
        world.addObject.restore();
      });
      it('should honor offset', function() {
        const spy = sinon.spy(world, 'addObject');
        host.events.trigger('death');
        expect(spy.callCount).to.be(1);
        expect(spy.lastCall.args[0]).to.be.a(Spawnable);
        expect(world.objects[2].position).to.eql({x: 13, y: 19, z: 0});
        world.addObject.restore();
      });
      it('should inherit host offset', function() {
        const spy = sinon.spy(world, 'addObject');
        host.position.set(19, 23, 3);
        host.events.trigger('death');
        expect(spy.callCount).to.be(1);
        expect(spy.lastCall.args[0]).to.be.a(Spawnable);
        expect(world.objects[3].position).to.eql({x: 19 + 13, y: 23 + 19, z: 3});
        world.addObject.restore();
      });
    });
  });
});
