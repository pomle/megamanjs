var expect = require('expect.js');
var sinon = require('sinon');

var env = require('../../importer.js');

var Collision = env.Engine.Collision;
var Obj = env.Engine.Object;

describe('Collision', function() {
  describe('#addObject', function() {
    context('when adding an object', function() {
      var collision = new Collision();
      var object = new Obj();
      collision.addObject(object);
      it('should add an object to object array', function() {
        expect(collision.objects).to.have.length(1);
        expect(collision.objects).to.contain(object);
      });
      it('should create a collision index array at same position', function() {
        expect(collision.collisionIndex).to.have.length(1);
        expect(collision.collisionIndex[0]).to.be.an(Array);
      });
      it('should create a placeholder in position cache', function() {
        expect(collision.positionCache).to.have.length(1);
        expect(collision.positionCache[0]).to.be(undefined);
      });
    });
    it('should except if argument not an object', function() {
      var collision = new Collision();
      expect(function() {
        collision.addObject(1);
      }).to.throwError(function(error) {
        expect(error).to.be.a(TypeError);
        expect(error.message).to.equal('Collidable wrong type');
      });
    });
  });
  describe('#detect', function() {
    it('should not test removed objects', function() {
      var collision = new Collision();
      var object = [
        new Obj(),
        new Obj(),
      ];
      object[0].collides = sinon.spy();
      object[1].collides = sinon.spy();
      object[0].addCollisionRect(7, 7);
      object[1].addCollisionRect(13, 13);
      collision.addObject(object[0]);
      collision.addObject(object[1]);
      collision.removeObject(object[1]);
      collision.detect();
      expect(object[1].collides.callCount).to.equal(0);
    });
    it('should call collide callback on colliding objects', function() {
      var collision = new Collision();
      var object = [
        new Obj(),
        new Obj(),
      ];
      object[0].collides = sinon.spy();
      object[1].collides = sinon.spy();
      object[0].addCollisionRect(7, 7);
      object[1].addCollisionRect(13, 13);
      collision.addObject(object[0]);
      collision.addObject(object[1]);
      collision.detect();
      expect(object[0].collides.callCount).to.equal(2);
      expect(object[1].collides.callCount).to.equal(2);

      var call1 = object[0].collides.getCall(0);
      expect(call1.args[0]).to.be(object[1]);
      expect(call1.args[1]).to.be(object[0].collision[0]);
      expect(call1.args[2]).to.be(object[1].collision[0]);

      var call2 = object[1].collides.getCall(0);
      expect(call2.args[0]).to.be(object[0]);
      expect(call2.args[1]).to.be(object[1].collision[0]);
      expect(call2.args[2]).to.be(object[0].collision[0]);
    });
    it('should gracefully handle object removal during loop', function() {
      var collision = new Collision();
      var object = [
        new Obj(),
        new Obj(),
      ];
      object[0].collides = sinon.spy(function(subject, ourZone, theirZone) {
        collision.removeObject(subject);
      });
      object[0].addCollisionRect(7, 7);
      object[1].addCollisionRect(13, 13);

      collision.addObject(object[0]);
      collision.addObject(object[1]);
      collision.detect();

      expect(object[0].collides.callCount).to.equal(1);
    });
  });
  describe('#garbageCollect', function() {
    var collision = new Collision();
    var objects = [
      new Obj(),
      new Obj(),
      new Obj(),
    ];
    collision.addObject(objects[0]);
    collision.addObject(objects[1]);
    collision.addObject(objects[2]);
    collision.detect();
    it('should clean up removed objects and counterparts', function() {
      collision.collisionIndex[1] = 'e5beb09b-f74a-49eb-8e3b-8734e9892bdc';
      collision.positionCache[1] = '942294a7-befd-41e3-a15a-a3ab96147343';
      collision.removeObject(objects[1]);
      collision.garbageCollect();
      expect(collision.collisionIndex).to.have.length(2);
      expect(collision.positionCache).to.have.length(2);
      expect(collision.collisionIndex)
        .to.not.contain('e5beb09b-f74a-49eb-8e3b-8734e9892bdc');
      expect(collision.positionCache)
        .to.not.contain('942294a7-befd-41e3-a15a-a3ab96147343');
    });
  });
  describe('#removeObject', function() {
    context('when removing an object', function() {
      var collision = new Collision();
      var object = new Obj();
      collision.addObject(object);
      collision.removeObject(object);
      it('should set object to undefined', function() {
        expect(collision.objects[0]).to.be(undefined);
      });
      it('should ignore removal of non-existing objects', function() {
        collision.removeObject(object);
      });
    });
  });
  describe('#objectsCollide', function() {
    var collision = new Collision();
    var o1, o2;
    beforeEach(function() {
      o1 = new Obj();
      o2 = new Obj();
      o1.addCollisionRect(7, 7);
      o2.addCollisionRect(13, 13);
    });
    it('should account for object position', function() {
      o2.position.set(10, 0, 0);
      expect(collision.objectsCollide(o1, o2)).to.be(false);
      o1.position.x = 1;
      expect(collision.objectsCollide(o1, o2)).to.be(true);
    });
    it('should account for zone offset', function() {
      o1.position.set(0, 0, 0);
      o2.position.set(10, 0, 0);
      expect(collision.objectsCollide(o1, o2)).to.be(false);
      o1.collision[0].position.x = 1;
      expect(collision.objectsCollide(o1, o2)).to.be(true);
    });
  });
});
