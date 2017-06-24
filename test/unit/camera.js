const expect = require('expect.js');
const sinon = require('sinon');

const THREE = require('three');
const Camera = require('../../src/engine/Camera');
const CameraPath = require('../../src/engine/CameraPath');

describe('Camera', function() {
  let camera;
  let realCamera;

  beforeEach(function() {
    camera = new Camera();
  });

  context('when instantiating', function() {
    it('should reference real camera position', function() {
      expect(camera.position).to.be(camera.camera.position);
    });
    it('should have real camera as property', function() {
      expect(camera.camera).to.be.a(THREE.Camera);
    });
    it('should have no path selected', function() {
      expect(camera.pathIndex).to.equal(-1);
    });
    it('should have no paths', function() {
      expect(camera.paths).to.be.an(Array);
      expect(camera.paths).to.have.length(0);
    });
  });
  describe('#addPath()', function() {
    it('should add a path to path array', function() {
      const path = new CameraPath();
      camera.addPath(path);
      expect(camera.paths).to.have.length(1);
      expect(camera.paths[0]).to.be(path);
    });
    it('should except if argument not a path', function() {
      expect(function() {
        camera.addPath('foo');
      }).to.throwError(function(error) {
        expect(error).to.be.an(TypeError);
        expect(error.message).to.equal('Invalid camera path');
      });
    });
  });
  describe('#follow()', function() {
    let mockObject;
    beforeEach(function() {
      mockObject = {
        position: new THREE.Vector3(),
      };
    });
    it('should set desiredPosition with default offset', function() {
      mockObject.position.set(7, 13);
      camera.followOffset.set(13, 14);
      camera.follow(mockObject)
      expect(camera.desiredPosition.x).to.equal(7);
      expect(camera.desiredPosition.y).to.equal(13);
      expect(camera.followOffset.x).to.equal(0);
      expect(camera.followOffset.y).to.equal(0);
    });
    it('should set desiredPosition and honor offset', function() {
      mockObject.position.set(7, 13);
      camera.follow(mockObject, new THREE.Vector3(13, 7, 19))
      expect(camera.desiredPosition.x).to.equal(7);
      expect(camera.desiredPosition.y).to.equal(13);
      expect(camera.followOffset.x).to.equal(13);
      expect(camera.followOffset.y).to.equal(7);
    });
    it('should set followObject property', function() {
      camera.follow(mockObject),
      expect(camera.followObject).to.be(mockObject);
    });
  });
  describe('#findPath()', function() {
    const camera = new Camera(new THREE.Camera());
    const path = [
      new CameraPath(),
      new CameraPath(),
    ];
    // First square window
    path[0].setWindow(0, 0, 100, 100);
    // Wider window overlapping previous
    path[1].setWindow(0, 0, 200, 100);
    camera.addPath(path[0]);
    camera.addPath(path[1]);

    context('when no path selected', function() {
      it('should set the pathIndex to first matching window', function() {
        camera.findPath({x: 10, y: 10});
        expect(camera.pathIndex).to.equal(0);
      });
    });
    context('when outside currently picked', function() {
      it('should find next suitable window', function() {
        camera.findPath({x: 110, y: 10});
        expect(camera.pathIndex).to.equal(1);
      });
    });
    context('when inside overlapping', function() {
      it('should not pick another window until leaving current', function() {
        camera.findPath({x: 10, y: 10});
        expect(camera.pathIndex).to.equal(1);
      });
    });
    context('when outside all windows', function() {
      it('should keep current pick', function() {
        camera.findPath({x: -10, y: -10});
        expect(camera.pathIndex).to.equal(1);
      });
    });
  });
  describe('#jumpTo()', function() {
    it('should set camera position to vector', function() {
      camera.jumpTo({x: 7, y: 13, z: 19});
      expect(camera.position.x).to.equal(7);
      expect(camera.position.y).to.equal(13);
      expect(camera.position.z).to.equal(19);
    });
    it('should ignore missing z from vector', function() {
      camera.position.z = 19;
      camera.jumpTo({x: 13, y: 7});
      expect(camera.position.x).to.equal(13);
      expect(camera.position.y).to.equal(7);
      expect(camera.position.z).to.equal(19);
    });
  });
  describe('#jumpToPath()', function() {
    it('should set camera position to vector and constrain it to path', function() {
      const path = new CameraPath();
      camera.addPath(path);
      path.setConstraint(5, 7, 15, 17);
      camera.jumpToPath(new THREE.Vector2(0, 0));
      expect(camera.position.x).to.equal(5);
      expect(camera.position.y).to.equal(7);
    });
  });
  describe('#panTo()', function() {
    it('should pan camera using supplied easing function', function() {
      const from = new THREE.Vector3(0, 0, 0);
      const to = new THREE.Vector3(300, 200, 100);
      camera.jumpTo(from);
      const easingSpy = sinon.spy(progress => {
        return progress;
      });
      camera.panTo(to, 7, easingSpy);
      expect(camera.position).to.eql({x: 0, y: 0, z: 0});
      camera.updateTime(3);
      expect(easingSpy.getCall(0).args).to.eql([3/7]);
      expect(camera.position).to.eql({
        x: 128.57142857142856,
        y: 85.71428571428571,
        z: 42.857142857142854
      });
      camera.updateTime(4);
      expect(easingSpy.getCall(1).args).to.eql([1]);
      expect(camera.position).to.eql(to);
    });
    it('should return a promise that resolves when destination reached', function(done) {
      camera.panTo(new THREE.Vector2(10, 20, 30), 2).then(() => {
        done();
      });
      camera.updateTime(2);
    });
    it('should use current z when supplied with vector 2', function() {
      camera.position.z = 13;
      const to = new THREE.Vector2(300, 200);
      camera.panTo(to, 1);
      camera.updateTime(1);
      expect(camera.position).to.eql({x:300, y:200, z:13});
    });
  });
  describe('#updateTime()', function() {
    it('should set velocity based on distance to desiredPosition', function() {
      const from = new THREE.Vector3(0, 0, 0);
      const to = new THREE.Vector3(300, 200, 0);
      camera.position.copy(from);
      camera.desiredPosition = to.clone();
      camera.updateTime(.016);
      expect(camera.velocity.x).to.equal(15);
      expect(camera.velocity.y).to.equal(10);
      camera.updateTime(.016);
      expect(camera.velocity.x).to.equal(14.25);
      expect(camera.velocity.y).to.equal(9.5);
    });
  });

  describe('Path', function() {
    context('when instantiating', function() {
      const path = new CameraPath();
      it('should contain windows and constraint vectors', function() {
        expect(path.constraint[0]).to.be.a(THREE.Vector3);
        expect(path.constraint[1]).to.be.a(THREE.Vector3);
        expect(path.window[0]).to.be.a(THREE.Vector2);
        expect(path.window[1]).to.be.a(THREE.Vector2);
      });
    });
    describe('#constrain()', function() {
      const path = new CameraPath();
      path.setConstraint(-100, -10, 100, 10);
      context('when vector inside constraint', function() {
        it('should leave vector untouched', function() {
          const vec = new THREE.Vector2();
          vec.set(10, 5);
          path.constrain(vec);
          expect(vec.x).to.equal(10);
          expect(vec.y).to.equal(5);
        });
      });
      context('when vector outside constraint', function() {
        it('should mutate vector to fit within constraint ', function() {
          const vec = new THREE.Vector2();
          vec.set(-200, -15);
          path.constrain(vec);
          expect(vec.x).to.equal(-100);
          expect(vec.y).to.equal(-10);
          vec.set(200, 15);
          path.constrain(vec);
          expect(vec.x).to.equal(100);
          expect(vec.y).to.equal(10);
        });
      });
    });
    describe('#inWindow()', function() {
      const path = new CameraPath();
      path.setWindow(-5, -5, 5, 5);
      it('should return false if any vector component outside window', function() {
        const vec = new THREE.Vector2();
        vec.set(0, 0);
        expect(path.inWindow(vec)).to.be(true);
        vec.set(-5.1, 0);
        expect(path.inWindow(vec)).to.be(false);
        vec.set(5.1, 0);
        expect(path.inWindow(vec)).to.be(false);
        vec.set(0, -5.1);
        expect(path.inWindow(vec)).to.be(false);
        vec.set(0, 5.1);
        expect(path.inWindow(vec)).to.be(false);
      });
      it('should treat vectors on boundary as inside', function() {
        const vec = new THREE.Vector2();
        vec.set(-5, -5);
        expect(path.inWindow(vec)).to.be(true);
        vec.set(5, 5);
        expect(path.inWindow(vec)).to.be(true);
      });
    });
    describe('#setConstraint()', function() {
      it('should assign constraint coordinates correctly', function() {
        const path = new CameraPath();
        path.setConstraint(-10, -15, 10, 15);
        expect(path.constraint[0].x).to.equal(-10);
        expect(path.constraint[0].y).to.equal(-15);
        expect(path.constraint[1].x).to.equal(10);
        expect(path.constraint[1].y).to.equal(15);
      });
    });
    describe('#setWindow()', function() {
      it('should assign window coordinates correctly', function() {
        const path = new CameraPath();
        path.setWindow(-10, -15, 10, 15);
        expect(path.window[0].x).to.equal(-10);
        expect(path.window[0].y).to.equal(-15);
        expect(path.window[1].x).to.equal(10);
        expect(path.window[1].y).to.equal(15);
      });
    });
  });
});
