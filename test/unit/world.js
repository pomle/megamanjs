const expect = require('expect.js');
const sinon = require('sinon');

const THREE = require('three');
const Obj = require('../../src/engine/Object');
const World = require('../../src/engine/World');

describe('World', function() {
  let world;
  let objects;
  beforeEach(function() {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial()
    );
    world = new World();
    world.timeStep = 1/120;
    objects = [
      new Obj(),
      new Obj(),
      new Obj(),
    ];
    objects.forEach(function(o) {
      o.timeShift = sinon.spy();
      o.setModel(mesh);
      world.addObject(o);
    });
  });

  context('on instantiation', function() {
    const world = new World();
    it('should have an ambient light', function() {
      expect(world.ambientLight).to.be.a(THREE.AmbientLight);
      expect(world.ambientLight.color).to.eql({r: 1, g: 1, b: 1});
    });
  });

  it('should handle removal of objects inside simulate loop but complete loop', function() {
    objects[0].timeShift = sinon.spy(function() {
      this.world.removeObject(objects[1]);
    });
    objects[1].timeShift = sinon.spy();
    world.simulateTime(0.16);
    expect(objects[0].timeShift.calledOnce).to.be(true);
    expect(objects[1].timeShift.calledOnce).to.be(true);
    expect(world.hasObject(objects[1])).to.be(false);
  });

  describe('#addObject', function() {
    it('should add object to collision detector', function() {
      const world = new World();
      world.addObject(objects[0]);
      expect(world.collision.objects).to.contain(objects[0]);
    });

    it('should add object model to scene', function() {
      const world = new World();
      world.scene.add = sinon.spy();
      world.addObject(objects[0]);
      expect(world.scene.add.callCount).to.equal(1);
      expect(world.scene.add.lastCall.args).to.eql([objects[0].model]);
    });

    it('should not add object model to scene if not set', function() {
      const world = new World();
      world.scene.add = sinon.spy();
      const obj = new Obj();
      world.addObject(obj);
      expect(world.scene.add.called).to.be(false);
    });

    it('should ignore object if already added', function() {
      expect(world.objects).to.have.length(3);
      expect(world.objects).to.contain(objects[0]);
      world.addObject(objects[0]);
      expect(world.objects).to.have.length(3);
    });

    it('should assign itself to object', function() {
      const world = new World();
      world.addObject(objects[0]);
      expect(objects[0].world).to.be(world);
    });

    it('should except if argument is not an object', function() {
      expect(function() {
        world.addObject(1);
      }).to.throwError(function(error) {
        expect(error).to.be.a(TypeError);
        expect(error.message).to.equal('Invalid object');
      });
    });
  });

  describe('#getObject', function() {
    it('should return object matching id', function() {
      objects[0].id = 'foo';
      expect(world.getObject('foo')).to.be(objects[0]);
    });

    it('should return false if no matching object', function() {
      expect(world.getObject('foo')).to.be(false);
    });
  });

  describe('#getObjects', function() {
    it('should return objects matching name', function() {
      objects[0].name = 'foo';
      objects[1].name = 'bar';
      objects[2].name = 'foo';
      const matches = world.getObjects('foo');
      expect(matches[0]).to.be(objects[0]);
      expect(matches[1]).to.be(objects[2]);
    });

    it('should return false if no matching object', function() {
      expect(world.getObject('foo')).to.be(false);
    });
  });

  describe('#removeObject', function() {
    it('should remove object from collision detector', function() {
      world.collision.removeObject = sinon.spy();
      world.removeObject(objects[0]);
      world.simulateTime(0);
      expect(world.collision.removeObject.callCount).to.equal(1);
      expect(world.collision.removeObject.lastCall.args).to.eql([objects[0]]);
    });

    it('should remove object model from scene', function() {
      world.scene.remove = sinon.spy();
      world.removeObject(objects[0]);
      world.simulateTime(0);
      expect(world.scene.remove.callCount).to.equal(1);
      expect(world.scene.remove.lastCall.args).to.eql([objects[0].model]);
    });

    it('should ignore object if object not in world', function() {
      world.removeObject(objects[0]);
      world.removeObject(objects[0]);
    });

    it('should resign itself from object', function() {
      world.removeObject(objects[0]);
      world.simulateTime(0);
      expect(objects[0].world).to.be(undefined);
    });

    it('should except if argument is not an object', function() {
      expect(function() {
        world.removeObject(1);
      }).to.throwError(function(error) {
        expect(error).to.be.a(TypeError);
        expect(error.message).to.equal('Invalid object');
      });
    });
  });

  describe('#doFor()', function() {
    it('should call callback for every simulation step for entire duration and supply elapsed time and progress fraction', function() {
      const callbackSpy = sinon.spy();
      world.timeStep = 1/30;
      world.doFor(2, callbackSpy);
      world.updateTime(1);
      expect(callbackSpy.callCount).to.be(30);
      expect(callbackSpy.getCall(0).args).to.eql([world.timeStep, 0.016666666666666666]);
      expect(callbackSpy.getCall(12).args[0]).to.be(0.4333333333333333);
      world.updateTime(2);
      expect(callbackSpy.lastCall.args).to.eql([2.0000000000000027, 1]);
    });

    it('should return a promise that resolves when done', function(done) {
      const callbackSpy = sinon.spy();
      world.timeStep = 1/30;
      world.doFor(2, callbackSpy).then(time => {
        done();
      });
      world.updateTime(2.1);
    });
  });

  describe('#waitFor()', function() {
    it('should return a promise that resolves when duration elapsed', function(done) {
      const callbackSpy = sinon.spy();
      world.timeStep = 1/30;
      world.waitFor(2).then(time => {
        done();
      });
      world.updateTime(2.1);
    });
  });

  describe('#simulateTime', function() {
    it('should supply each object with time', function() {
      world.simulateTime(0.16);
      expect(objects[0].timeShift.callCount).to.equal(1);
      expect(objects[0].timeShift.lastCall.args).to.eql([0.16, 0.16]);
      expect(objects[1].timeShift.callCount).to.equal(1);
      expect(objects[1].timeShift.lastCall.args).to.eql([0.16, 0.16]);
      expect(objects[2].timeShift.callCount).to.equal(1);
      expect(objects[2].timeShift.lastCall.args).to.eql([0.16, 0.16]);
    });

    it('should trigger a collision detection run', function() {
      world.collision.detect = sinon.spy();
      world.simulateTime(0.16);
      expect(world.collision.detect.callCount).to.equal(1);
    });

    it('should clean removed objects', function() {
      expect(world.objects).to.contain(objects[1]);
      expect(world.objects).to.have.length(3);
      world.removeObject(objects[1]);
      world.simulateTime(0.16);
      expect(world.objects).to.not.contain(objects[1]);
      expect(world.objects).to.have.length(2);
    });

    context('simulation event', function() {
      it('should be emitted only when time passed', function() {
        const callbackSpy = sinon.spy();
        world.events.bind(world.EVENT_SIMULATE, callbackSpy);
        world.simulateTime(0);
        world.simulateTime(0);
        world.simulateTime(0);
        expect(callbackSpy.callCount).to.be(0);
      });

      it('should contain delta time, total time and tick count', function() {
        const callbackSpy = sinon.spy();
        world.events.bind(world.EVENT_SIMULATE, callbackSpy);
        world.simulateTime(.1);
        world.simulateTime(.2);
        world.simulateTime(.3);
        expect(callbackSpy.callCount).to.be(3);
        expect(callbackSpy.getCall(0).args).to.eql([.1, .1, 0]);
        expect(callbackSpy.getCall(1).args).to.eql([.2, 0.30000000000000004, 1]);
        expect(callbackSpy.getCall(2).args).to.eql([.3, 0.6000000000000001, 2]);
      });
    });
  });

  describe('#updateTime', function() {
    it('should feed fixed time to simulation regardless of time passed', function() {
      let acc = 0;
      while (acc < 1) {
        const time = Math.min(1 - acc, Math.random() * 0.1);
        acc += time;
        world.updateTime(time);
      };
      for (let i = 0, l = objects[0].timeShift.callCount; i !== l; ++i) {
        expect(objects[0].timeShift.getCall(i).args[0]).to.equal(world.timeStep);
      }
    });

    it('should multiply time with time stretch of world', function() {
      world.timeStretch = 1.5;
      world.updateTime(0.16);
      expect(objects[0].timeShift.lastCall.args).to.eql([0.008333333333333333, 0.2333333333333333]);
    });

    it('should accumulate time in timeTotal property', function() {
      world.updateTime(0.05);
      world.updateTime(0.07);
      world.updateTime(0.13);
      expect(world._timeTotal).to.be.within(0.24999999999999995, 0.25);
    });

    it('should propagate total time to objects', function() {
      world.updateTime(0.07);
      world.updateTime(0.13);
      expect(objects[1].timeShift.lastCall.args).to.eql([world.timeStep, 0.19999999999999998]);
    });

    it('should trigger EVENT_UPDATE with current and total time', function() {
      const callback = sinon.spy();
      world.events.bind(world.EVENT_UPDATE, callback);
      world.updateTime(0.16);
      world.updateTime(0.12);
      expect(callback.callCount).to.equal(2);
      expect(callback.lastCall.args).to.eql([0.12, 0.275]);
    });

    it('should emit update event once regardless of simulation iterations', function() {
      const simulateSpy = sinon.spy();
      const updateSpy = sinon.spy();
      world.events.bind(world.EVENT_SIMULATE, simulateSpy);
      world.events.bind(world.EVENT_UPDATE, updateSpy);
      world.updateTime(1);
      expect(simulateSpy.callCount).to.equal(120);
      expect(updateSpy.callCount).to.equal(1);
    });
  });
});
