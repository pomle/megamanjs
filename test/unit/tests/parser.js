var expect = require('expect.js');
var sinon = require('sinon');
var fs = require('fs');

var env = require('../../importer.js');
var Engine = env.Engine;
var THREE = env.THREE;
var DOMParser = require('xmldom').DOMParser;
var Parser = env.Game.Loader.XML.Parser;
var ObjectParser = env.Game.Loader.XML.Parser.ObjectParser;
var LevelParser = env.Game.Loader.XML.Parser.LevelParser;
var TraitParser = env.Game.Loader.XML.Parser.TraitParser;

function createNode(xml) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(xml, 'text/xml');
  return doc.childNodes[0];
}

function getNode(name) {
  var xml = fs.readFileSync(__dirname + '/fixtures/' + name + '.xml', 'utf8');
  return createNode(xml);
}

describe('Parser', function() {
  beforeEach(function() {
    global.Image = sinon.spy(function() {
      this.src = '';
      this.onload = undefined;
    });
  });

  afterEach(function() {
    delete global.Image;
  });

  context('#getAttr', function() {
    it('should return null if attribute does not exist', function() {
      var parser = new Parser();
      var node = createNode('<moot/>');
      expect(parser.getAttr(node, 'foo')).to.be(null);
    });
    it('should return string if attribute set', function() {
      var parser = new Parser();
      var node = createNode('<moot foo="bar"/>');
      expect(parser.getAttr(node, 'foo')).to.equal("bar");
    });
    it('should return null if attribute empty', function() {
      var parser = new Parser();
      var node = createNode('<moot foo=""/>');
      expect(parser.getAttr(node, 'foo')).to.equal(null);
    });
  });

  context('#getRange', function() {
    var node, range, parser;
    it('should interpret modulus', function() {
      parser = new Parser();
      node = createNode('<node range="0-10/2" />');
      range = parser.getRange(node, 'range', 10);
      expect(range).to.eql([0, 2, 4, 6, 8, 10]);
      node = createNode('<node range="1-9/3" />');
      range = parser.getRange(node, 'range', 10);
      expect(range).to.eql([1, 4, 7]);
    });
    it('should honor ranges', function() {
      node = createNode('<node range="3-13" />');
      range = parser.getRange(node, 'range', 100);
      expect(range).to.eql([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    });
    it('should honor wildcard', function() {
      node = createNode('<node range="*" />');
      range = parser.getRange(node, 'range', 19);
      expect(range).to.eql([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    });
    it('should parse and merge multiple groups', function() {
      node = createNode('<node range="1-3,20-24,500-510/2,1013-1019" />');
      range = parser.getRange(node, 'range');
      expect(range).to.eql([1,2,3,20,21,22,23,24,500,502,504,506,508,510,1013,1014,1015,1016,1017,1018,1019]);
    });
  });

  context('#getVector2', function() {
    it('should return null if any attribute missing', function() {
      var parser = new Parser();
      var node;
      node = createNode('<moot/>');
      expect(parser.getVector2(node)).to.be(null);
      node = createNode('<moot x="" y=""/>');
      expect(parser.getVector2(node)).to.be(null);
      node = createNode('<moot x="12" y=""/>');
      expect(parser.getVector2(node)).to.be(null);
      node = createNode('<moot x="" y="13"/>');
      expect(parser.getVector2(node)).to.be(null);
    });
    it('should default parse x and y attributes', function() {
      var parser = new Parser();
      var node = createNode('<moot x="13" y="17" />');
      expect(parser.getVector2(node)).to.eql({x: 13, y: 17});
    });
    it('should allow attribute key substitution', function() {
      var parser = new Parser();
      var node;
      node = createNode('<moot w="10" h="12"/>');
      expect(parser.getVector2(node, 'w', 'h')).to.eql({x: 10, y: 12});
    });
  });

  context('#getVector3', function() {
    it('should return null if x or y missing', function() {
      var parser = new Parser();
      var node;
      node = createNode('<moot/>');
      expect(parser.getVector3(node)).to.be(null);
      node = createNode('<moot x="" y="" z=""/>');
      expect(parser.getVector3(node)).to.be(null);
      node = createNode('<moot x="12" y="" />');
      expect(parser.getVector3(node)).to.be(null);
      node = createNode('<moot x="" y="13"/>');
      expect(parser.getVector3(node)).to.be(null);
      node = createNode('<moot x="" y="13"/>');
      expect(parser.getVector3(node)).to.be(null);
    });
    it('should default parse x, y, and z attributes', function() {
      var parser = new Parser();
      var node = createNode('<moot x="13" y="17" z="11" />');
      expect(parser.getVector3(node)).to.eql({x: 13, y: 17, z: 11});
    });
    it('should default z to 0 if not available', function() {
      var parser = new Parser();
      var node = createNode('<moot x="13" y="17"/>');
      expect(parser.getVector3(node)).to.eql({x: 13, y: 17, z: 0});
    });
    it('should allow attribute key substitution', function() {
      var parser = new Parser();
      var node;
      node = createNode('<moot w="10" h="12" r="5"/>');
      expect(parser.getVector3(node, 'w', 'h', 'r')).to.eql({x: 10, y: 12, z: 5});
    });
  });

  describe('for Objects', function() {
    describe('#parse', function() {
      var objects, character;
      it('should return an object indexed by object names', function() {
        var objectsNode = getNode('character');
        var parser = new ObjectParser();
        objects = parser.parse(objectsNode);
        expect(objects).to.be.an(Object);
        expect(objects).to.have.property('Megaman');
      });
      it('should provide a constructor for object', function() {
        character = new objects['Megaman'];
        expect(character).to.be.a(Game.objects.Character);
      });
      context('Animations', function() {
        it('should have correct UV maps', function() {
          expect(character.animations['idle']).to.be.an(Engine.Animator.Animation);
          var uvs = character.animations['idle'].getValue(0);
          expect(uvs).to.be.an(Engine.UVCoords);
          expect(uvs[0][0].x).to.equal(0);
          expect(uvs[0][0].y).to.equal(1);
          expect(uvs[0][1].x).to.equal(0);
          expect(uvs[0][1].y).to.equal(0.8125);
          expect(uvs[0][2].x).to.equal(0.1875);
          expect(uvs[0][2].y).to.equal(1);

          expect(uvs[1][0].x).to.equal(0);
          expect(uvs[1][0].y).to.equal(0.8125);
          expect(uvs[1][1].x).to.equal(0.1875);
          expect(uvs[1][1].y).to.equal(0.8125);
          expect(uvs[1][2].x).to.equal(0.1875);
          expect(uvs[1][2].y).to.equal(1);
        });
      });
      it('should have default animation on construction', function() {
        var uvs = character.animations['__default'].getValue(0);
        expect(character.model.geometry.faceVertexUvs[0][0]).to.eql(uvs[0]);
        expect(character.model.geometry.faceVertexUvs[0][1]).to.eql(uvs[1]);
      });
    });
    describe('#parseAnimations', function() {
      var textureMock = {size: {x: 128, y: 128}};
      var UVCoordsSpy;
      beforeEach(function() {
        UVCoordsSpy = sinon.spy(Engine, 'UVCoords');
      });
      afterEach(function() {
        UVCoordsSpy.restore();
      });
      context('when animation group node has size specified', function() {
        it('should use size from animation group node', function() {
          var node = createNode('<animations w="48" h="44">' +
            '<animation id="moot">' +
              '<frame x="32" y="16"/>' +
            '</animation>' +
          '</animations>');
          var parser = new ObjectParser();
          var frameNode = node.childNodes[0];
          var animation = parser.parseAnimation(frameNode, textureMock);
          expect(UVCoordsSpy.callCount).to.equal(1);
          expect(UVCoordsSpy.lastCall.args[0]).to.eql({x: 32, y: 16});
          expect(UVCoordsSpy.lastCall.args[1]).to.eql({x: 48, y: 44});
          expect(UVCoordsSpy.lastCall.args[2]).to.eql({x: 128, y: 128});
        });
      });
      context('when animation node has size specified', function() {
        it('should use size from animation node', function() {
          var node = createNode('<animations w="48" h="48">' +
            '<animation id="moot" w="24" h="22">' +
              '<frame x="32" y="16"/>' +
            '</animation>' +
          '</animations>');
          var parser = new ObjectParser();
          var frameNode = node.childNodes[0];
          var animation = parser.parseAnimation(frameNode, textureMock);
          expect(UVCoordsSpy.callCount).to.equal(1);
          expect(UVCoordsSpy.lastCall.args[0]).to.eql({x: 32, y: 16});
          expect(UVCoordsSpy.lastCall.args[1]).to.eql({x: 24, y: 22});
          expect(UVCoordsSpy.lastCall.args[2]).to.eql({x: 128, y: 128});
        });
      });
      context('when frame has size specified', function() {
        it('should use size from frame', function() {
          var node = createNode('<animations w="48" h="48">' +
            '<animation id="moot" w="24" h="22">' +
              '<frame x="32" y="16" w="12" h="11"/>' +
            '</animation>' +
          '</animations>');
          var parser = new ObjectParser();
          var frameNode = node.childNodes[0];
          var animation = parser.parseAnimation(frameNode, textureMock);
          expect(UVCoordsSpy.callCount).to.equal(1);
          expect(UVCoordsSpy.lastCall.args[0]).to.eql({x: 32, y: 16});
          expect(UVCoordsSpy.lastCall.args[1]).to.eql({x: 12, y: 11});
          expect(UVCoordsSpy.lastCall.args[2]).to.eql({x: 128, y: 128});
        });
      });
      it('should parse an animation node', function() {
        var node = getNode('animations');
        var parser = new ObjectParser();
        var animations = parser.parseAnimations(node,
                                                {foo: {size: {x: 256, y: 256}}});
        var animation = animations['__default'];
        expect(animation).to.be.a(Engine.Animator.Animation);
        expect(animation.id).to.equal('idle');
        expect(animation.length).to.equal(2);
        var uvs = animation.getValue(0);
        expect(uvs).to.be.an(Engine.UVCoords);
        expect(uvs[0][0].x).to.equal(0);
        expect(uvs[0][0].y).to.equal(1);
        expect(uvs[0][1].x).to.equal(0);
        expect(uvs[0][1].y).to.equal(0.8125);
        expect(uvs[0][2].x).to.equal(0.1875);
        expect(uvs[0][2].y).to.equal(1);

        expect(uvs[1][0].x).to.equal(0);
        expect(uvs[1][0].y).to.equal(0.8125);
        expect(uvs[1][1].x).to.equal(0.1875);
        expect(uvs[1][1].y).to.equal(0.8125);
        expect(uvs[1][2].x).to.equal(0.1875);
        expect(uvs[1][2].y).to.equal(1);
      });
    });
    describe('#parseTextures', function() {
      var textures, character;
      it('should return an object indexed by texture names', function() {
        var texturesNode = getNode('textures');
        var parser = new ObjectParser();
        textures = parser.parseTextures(texturesNode);
        expect(textures).to.be.an(Object);
        expect(textures).to.have.property('moot');
        expect(textures).to.have.property('foo');
        expect(textures).to.have.property('bar');
      });
      it('should provide texture size', function() {
        expect(textures['moot'].size).to.eql({x: 256, y: 128});
        expect(textures['foo'].size).to.eql({x: 129, y: 256});
        expect(textures['bar'].size).to.eql({x: 64, y: 96});
      });
      it('should provide texture instances', function() {
        expect(textures['moot'].texture).to.be.a(THREE.Texture);
        expect(textures['foo'].texture).to.be.a(THREE.Texture);
        expect(textures['bar'].texture).to.be.a(THREE.Texture);
      });
      it('should have the first found texture as default', function() {
        expect(textures['__default']).to.be(textures['moot']);
      });
      it.skip('should load images', function() {
        expect(textures['moot'].texture.image.src).to.equal('moot.png');
      });
    });
  });
  describe('for Levels', function() {
    var level;
    it('should parse a level', function(done) {
      var game = new Game();
      game.player = new Game.Player();
      var sceneNode = getNode('level');
      var parser = new LevelParser({game: game});
      parser.parse(sceneNode)
      .then(function(_level) {
        level = _level;
        expect(level).to.be.a(Game.Scene);
        done();
      })
      .catch(done);
    });
    it('should create objects with valid positions', function() {
      level.world.objects.forEach(function(object) {
        expect(object.position).to.be.a(THREE.Vector3);
        expect(object.position.x).to.be.a('number');
        expect(object.position.y).to.be.a('number');
        expect(object.position.z).to.be.a('number');
        if (object.model) {
          expect(object.model.material.map).to.be.a(THREE.Texture);
        }
      });
    });
    it('should not put any objects in scene without texture ', function() {
      level.world.scene.children.forEach(function(mesh) {
        if (mesh.material && !mesh.material.map) {
          console.error('Mesh missing texture', mesh);
        }
      });
    });
    context('Object Parsing', function() {
      var object;
      it('should name object', function() {
        object = level.world.getObject('test');
        expect(object.name).to.equal('test');
      });
      it('should take out face indices properly', function() {
        object = level.world.getObject('json-index-only');
        expect(object.animators[0].indices).to.eql([0, 1, 2, 3, 4, 100, 112]);
        object = level.world.getObject('range-index-star');
        expect(object.animators[0].indices).to.eql([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]);
      });
    });
    it('should parse checkpoints', function() {
      expect(level.checkPoints).to.have.length(3);
      expect(level.checkPoints[0]).to.eql({pos: {x: 136, y: -165}, radius: 100});
      expect(level.checkPoints[1]).to.eql({pos: {x: 1920, y: -661}, radius: 100});
      expect(level.checkPoints[2]).to.eql({pos: { x: 4736, y: -1109}, radius: 13});
    });
    context('Camera', function() {
      it('should have smoothing', function() {
        expect(level.camera.smoothing).to.be.a('number');
        expect(level.camera.smoothing).to.equal(13.5);
      });
      it('should have paths', function() {
        var paths = level.camera.paths;
        expect(paths).to.have.length(3);
        expect(paths[0].window[0]).to.eql({x: 0, y: -208, z: 0});
        expect(paths[0].window[1]).to.eql({x: 2048, y: 0, z: 0});
        expect(paths[0].constraint[0]).to.eql({x: 180, y: -120, z: 150});
        expect(paths[0].constraint[1]).to.eql({x: 1920, y: -120, z: 150});
      });
    });
  });
  describe('for Traits', function() {
    context('when parsing by default scheme', function() {
      it('should prefer parsing floats', function() {
        var node = createNode('<trait source="Fallaway" test1="0" test2="13.12" test3="ab" test4="-124.0"/>');
        var parser = new TraitParser();
        var Trait = parser.parseTrait(node);
        var trait = new Trait();
        expect(trait.test1).to.equal(0);
        expect(trait.test2).to.equal(13.12);
        expect(trait.test3).to.equal('ab');
        expect(trait.test4).to.equal(-124.0);
      });
    });
  });
});
