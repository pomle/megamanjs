var expect = require('expect.js');
var sinon = require('sinon');

var env = require('../../importer.js');

var Camera = env.Engine.Camera;
var THREE = env.THREE;

describe('Camera', function() {
  var camera;
  var realCamera;

  beforeEach(function() {
    realCamera = new THREE.Camera();
    camera = new Camera(realCamera);
  });

  context('when instantiating', function() {
    it('should have real camera as property', function() {
      expect(camera.camera).to.be(realCamera);
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
    var camera = new Camera();
    it('should add a path to path array', function() {
      var path = new Camera.Path();
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
    var mockObject;
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
    var camera = new Camera();
    var path = [
      new Camera.Path(),
      new Camera.Path(),
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
      expect(realCamera.position.x).to.equal(7);
      expect(realCamera.position.y).to.equal(13);
      expect(realCamera.position.z).to.equal(19);
    });
    it('should ignore missing z from vector', function() {
      realCamera.position.z = 19;
      camera.jumpTo({x: 13, y: 7});
      expect(realCamera.position.x).to.equal(13);
      expect(realCamera.position.y).to.equal(7);
      expect(realCamera.position.z).to.equal(19);
    });
  });
  describe('#jumpToPath()', function() {
    it('should set camera position to vector and constrain it to path', function() {
      var path = new Camera.Path();
      camera.addPath(path);
      path.setConstraint(5, 7, 15, 17);
      camera.jumpToPath(new THREE.Vector2(0, 0));
      expect(realCamera.position.x).to.equal(5);
      expect(realCamera.position.y).to.equal(7);
    });
  });
  describe('#panTo()', function() {
    it('should pan camera to new position', function() {
      var from = new THREE.Vector2(0, 0);
      var to = new THREE.Vector2(300, 200);
      camera.jumpTo(from);
      camera.panTo(to);
      expect(realCamera.position.x).to.equal(0);
      expect(realCamera.position.y).to.equal(0);
      expect(camera.desiredPosition.x).to.equal(300);
      expect(camera.desiredPosition.y).to.equal(200);
    });
  });
  describe('#updateTime()', function() {
    it('should set velocity based on distance to desiredPosition', function() {
      var from = new THREE.Vector2(0, 0);
      var to = new THREE.Vector2(300, 200);
      camera.jumpTo(from);
      camera.panTo(to);
      camera.updateTime(.016);
      expect(camera.velocity.x).to.equal(15);
      expect(camera.velocity.y).to.equal(10);
      camera.updateTime(.016);
      expect(camera.velocity.x).to.equal(14.25);
      expect(camera.velocity.y).to.equal(9.5);

    });
  });
});

describe('CameraPath', function() {
  context('when instantiating', function() {
    var path = new Camera.Path();
    it('should contain windows and constrait vectors', function() {
      expect(path.constraint[0]).to.be.a(THREE.Vector3);
      expect(path.constraint[1]).to.be.a(THREE.Vector3);
      expect(path.window[0]).to.be.a(THREE.Vector2);
      expect(path.window[1]).to.be.a(THREE.Vector2);
    });
  });
  describe('#constrain()', function() {
    var path = new Camera.Path();
    path.setConstraint(-100, -10, 100, 10);
    context('when vector inside constraint', function() {
      it('should leave vector untouched', function() {
        var vec = new THREE.Vector2();
        vec.set(10, 5);
        path.constrain(vec);
        expect(vec.x).to.equal(10);
        expect(vec.y).to.equal(5);
      });
    });
    context('when vector outside constraint', function() {
      it('should mutate vector to fit within constraint ', function() {
        var vec = new THREE.Vector2();
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
    var path = new Camera.Path();
    path.setWindow(-5, -5, 5, 5);
    it('should return false if any vector component outside window', function() {
      var vec = new THREE.Vector2();
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
      var vec = new THREE.Vector2();
      vec.set(-5, -5);
      expect(path.inWindow(vec)).to.be(true);
      vec.set(5, 5);
      expect(path.inWindow(vec)).to.be(true);
    });
  });
  describe('#setConstraint()', function() {
    it('should assing constraint coordinates correctly', function() {
      var path = new Camera.Path();
      path.setConstraint(-10, -15, 10, 15);
      expect(path.constraint[0].x).to.equal(-10);
      expect(path.constraint[0].y).to.equal(-15);
      expect(path.constraint[1].x).to.equal(10);
      expect(path.constraint[1].y).to.equal(15);
    });
  });
  describe('#setWindow()', function() {
    it('should assign window coordinates correctly', function() {
      var path = new Camera.Path();
      path.setWindow(-10, -15, 10, 15);
      expect(path.window[0].x).to.equal(-10);
      expect(path.window[0].y).to.equal(-15);
      expect(path.window[1].x).to.equal(10);
      expect(path.window[1].y).to.equal(15);
    });
  });
});
