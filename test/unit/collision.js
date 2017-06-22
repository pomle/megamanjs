'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const THREE = require('three');
const Collision = require('../../src/engine/Collision');
const Obj = require('../../src/engine/Object');

describe('Collision', function() {
  it('should not re-test positionally static objects', function() {
    const collision = new Collision();
    const objects = [
       new Obj(),
       new Obj(),
    ];
    objects[0].collides = sinon.spy();
    objects[1].collides = sinon.spy();
    objects[0].addCollisionRect(5, 5);
    objects[1].addCollisionRect(5, 5);
    collision.addObject(objects[0]);
    collision.addObject(objects[1]);
    objects[0].position.x = 1;
    collision.detect();
    expect(objects[0].collides.callCount).to.equal(2);
    expect(objects[1].collides.callCount).to.equal(2);
    collision.detect();
    expect(objects[0].collides.callCount).to.equal(2);
    expect(objects[1].collides.callCount).to.equal(2);
    objects[0].position.x = 2;
    collision.detect();
    expect(objects[0].collides.callCount).to.equal(3);
    expect(objects[1].collides.callCount).to.equal(3);
  });
  describe('#addObject', function() {
    context('when adding an object', function() {
      const collision = new Collision();
      const object = new Obj();
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
        expect(collision.positionCache[0]).to.be.a(THREE.Vector2);
        expect(collision.positionCache[0].x).to.be(undefined);
        expect(collision.positionCache[0].y).to.be(undefined);
      });
    });
    it('should except if argument not an object', function() {
      const collision = new Collision();
      expect(function() {
        collision.addObject(1);
      }).to.throwError(function(error) {
        expect(error).to.be.a(TypeError);
        expect(error.message).to.equal('Collidable wrong type');
      });
    });
  });
  describe('#detect', function() {
    it('should call collide callback on colliding objects', function() {
      const collision = new Collision();
      const object = [
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

      const call1 = object[0].collides.getCall(0);
      expect(call1.args[0]).to.be(object[1]);
      expect(call1.args[1]).to.be(object[0].collision[0]);
      expect(call1.args[2]).to.be(object[1].collision[0]);

      const call2 = object[1].collides.getCall(0);
      expect(call2.args[0]).to.be(object[0]);
      expect(call2.args[1]).to.be(object[1].collision[0]);
      expect(call2.args[2]).to.be(object[0].collision[0]);
    });
    it('should call uncollide callback on objects that are no longer touching', function() {
      const collision = new Collision();
      const object = [
        new Obj(),
        new Obj(),
      ];
      object[0].collides = sinon.spy();
      object[1].collides = sinon.spy();
      object[0].uncollides = sinon.spy();
      object[1].uncollides = sinon.spy();
      object[0].addCollisionRect(7, 7);
      object[1].addCollisionRect(13, 13);
      collision.addObject(object[0]);
      collision.addObject(object[1]);
      collision.detect();
      expect(object[0].collides.callCount).to.equal(2);
      expect(object[1].collides.callCount).to.equal(2);
      object[0].position.x = 20;
      collision.detect();
      expect(object[0].collides.callCount).to.equal(2);
      expect(object[1].collides.callCount).to.equal(2);
      expect(object[0].uncollides.callCount).to.equal(1);
      expect(object[1].uncollides.callCount).to.equal(1);
      expect(object[0].uncollides.lastCall.args[0]).to.be(object[1]);
      expect(object[1].uncollides.lastCall.args[0]).to.be(object[0]);
    });
    it('should gracefully handle object removal during loop', function() {
      const collision = new Collision();
      const object = [
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

      expect(object[0].collides.callCount).to.equal(2);
    });
  });
  describe('#garbageCollect', function() {
    const collision = new Collision();
    const objects = [
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
    it('should prevent an object from being collision detected', function() {
      const collision = new Collision();
      const object = [
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
  });
  describe('#objectsCollide', function() {
    let collision;
    let o1, o2;
    beforeEach(function() {
      collision = new Collision();
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
    it('should return false if objects outside optimization range', function() {
      delete o1.collision;
      o1.position.distanceToSquared = sinon.spy(function() {
        return 101;
      })
      collision.setCollisionRadius(10);
      expect(collision.objectsCollide(o1, o2)).to.be(false);
      expect(o1.position.distanceToSquared.calledOnce).to.be(true);
    });
  });
  describe('#setCollisionRadius', function() {
    it('should set value squared', function() {
      const collision = new Collision();
      collision.setCollisionRadius(10);
      expect(collision.collisionMaxDistanceSq).to.equal(100);
      collision.setCollisionRadius(12);
      expect(collision.collisionMaxDistanceSq).to.equal(144);
    });
  });
  describe('BoundingBox', function() {
    const host = new Obj();
    host.addCollisionRect(5, 7);
    const box = host.collision[0];
    it('should have x and y', function() {
      expect(box.x).to.equal(0);
      expect(box.y).to.equal(0);
    });
    it('should have width and height', function() {
      expect(box.width).to.equal(5);
      expect(box.height).to.equal(7);
    });
    it('should provide absolute left, right, top, bottom', function() {
      expect(box.left).to.equal(-2.5);
      expect(box.right).to.equal(2.5);
      expect(box.top).to.equal(3.5);
      expect(box.bottom).to.equal(-3.5);
    });
    it('should update automatically if host moves', function() {
      host.position.x += 8;
      host.position.y += 4;
      expect(box.x).to.equal(8);
      expect(box.y).to.equal(4);
      expect(box.left).to.equal(5.5);
      expect(box.right).to.equal(10.5);
      expect(box.top).to.equal(7.5);
      expect(box.bottom).to.equal(0.5);
    });
    it('should move host if values set', function() {
      box.top = 0;
      box.left = 0;
      expect(host.position.x).to.equal(2.5);
      expect(host.position.y).to.equal(-3.5);
      box.bottom = 0;
      box.right = 0;
      expect(host.position.x).to.equal(-2.5);
      expect(host.position.y).to.equal(3.5);
    });
  });
});
