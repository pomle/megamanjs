var expect = require('expect.js');
var sinon = require('sinon');

var env = require('../../importer.js');
var THREE = env.THREE;
var Obj = env.Engine.Object;
var World = env.Engine.World;

describe('World', function() {
  var world;
  var objects;
  beforeEach(function() {
    world = new World();
    objects = [
      new Obj(),
      new Obj(),
      new Obj(),
    ];
    objects.forEach(function(o) {
      o.timeShift = sinon.spy();
      world.addObject(o);
    });
  });

  context('on instantiation', function() {
    var world = new World();
    it('should have an ambient light', function() {
      expect(world.ambientLight).to.be.a(THREE.AmbientLight);
      expect(world.ambientLight.color).to.eql({r: 1, g: 1, b: 1});
    });
  });
  it('should handle removal of objects inside update loop', function() {
    objects[0].timeShift = sinon.spy(function() {
      this.world.removeObject(objects[1]);
    });
    objects[1].timeShift = sinon.spy();
    world.updateTime(0.16);
    expect(objects[0].timeShift.calledOnce).to.be(true);
    expect(objects[1].timeShift.called).to.be(false);
  });
  describe('#addObject', function() {
    it('should add object to collision detector', function() {
      var world = new World();
      world.addObject(objects[0]);
      expect(world.collision.objects).to.contain(objects[0]);
    });
    it('should add object model to scene', function() {
      var world = new World();
      world.scene.add = sinon.spy();
      world.addObject(objects[0]);
      expect(world.scene.add.callCount).to.equal(1);
      expect(world.scene.add.lastCall.args).to.eql([objects[0].model]);
    });
    it('should ignore object if already added', function() {
      expect(world.objects).to.have.length(3);
      expect(world.objects).to.contain(objects[0]);
      world.addObject(objects[0]);
      expect(world.objects).to.have.length(3);
    });
    it('should assign itself to object', function() {
      var world = new World();
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
    it('should return object matching name', function() {
      objects[0].name = 'foo';
      expect(world.getObject('foo')).to.be(objects[0]);
    });
    it('should return false if no matching object', function() {
      expect(world.getObject('foo')).to.be(false);
    });
  });
  describe('#removeObject', function() {
    it('should remove object from collision detector', function() {
      world.removeObject(objects[0]);
      expect(world.collision.objects).to.not.contain(objects[0]);
    });
    it('should remove object model from scene', function() {
      world.scene.remove = sinon.spy();
      world.removeObject(objects[0]);
      expect(world.scene.remove.callCount).to.equal(1);
      expect(world.scene.remove.lastCall.args).to.eql([objects[0].model]);
    });
    it('should ignore object if object not in world', function() {
      world.removeObject(objects[0]);
      world.removeObject(objects[0]);
    });
    it('should resign itself from object', function() {
      world.removeObject(objects[0]);
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
  describe('#updateTime', function() {
    it('should supply each object with time', function() {
      world.updateTime(0.16);
      expect(objects[0].timeShift.callCount).to.equal(1);
      expect(objects[0].timeShift.lastCall.args).to.eql([0.16, 0.16]);
      expect(objects[1].timeShift.callCount).to.equal(1);
      expect(objects[1].timeShift.lastCall.args).to.eql([0.16, 0.16]);
      expect(objects[2].timeShift.callCount).to.equal(1);
      expect(objects[2].timeShift.lastCall.args).to.eql([0.16, 0.16]);
    });
    it('should multiply time with object time multiplier', function() {
      world.timeStretch = 1.5;
      objects[0].timeStretch = 1.2;
      world.updateTime(0.16);
      expect(objects[0].timeShift.lastCall.args).to.eql([0.288, 0.24]);
      expect(objects[1].timeShift.lastCall.args).to.eql([0.24, 0.24]);
    });
    it('should multiply time with time stretch of world', function() {
      world.timeStretch = 1.5;
      world.updateTime(0.16);
      expect(objects[0].timeShift.lastCall.args).to.eql([0.24, 0.24]);
    });
    it('should accumulate time in timeTotal property', function() {
      world.updateTime(0.05);
      world.updateTime(0.07);
      world.updateTime(0.13);
      expect(world.timeTotal).to.equal(0.25);
    });
    it('should propagete total time to objects', function() {
      world.updateTime(0.07);
      world.updateTime(0.13);
      expect(objects[1].timeShift.lastCall.args).to.eql([0.13, 0.20]);
    });
    it('should trigger a collision detection run', function() {
      world.collision.detect = sinon.spy();
      world.updateTime(0.16);
      expect(world.collision.detect.callCount).to.equal(1);
    });
    it('should clean removed objects', function() {
      expect(world.objects).to.contain(objects[1]);
      expect(world.objects).to.have.length(3);
      world.removeObject(objects[1]);
      world.updateTime(0.16);
      expect(world.objects).to.not.contain(objects[1]);
      expect(world.objects).to.have.length(2);
    });
    it('should trigger EVENT_UPDATE with current and total time', function() {
      var callback = sinon.spy();
      world.events.bind(world.EVENT_UPDATE, callback);
      world.timeTotal = 1.07;
      world.updateTime(0.16);
      expect(callback.callCount).to.equal(1);
      expect(callback.lastCall.args).to.eql([0.16, 1.23]);
    });
  })
});
