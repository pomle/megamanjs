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
    it('should parse a level', function(done) {
      var game = new Game();
      game.player = new Game.Player();
      var sceneNode = getNode('level');
      var parser = new LevelParser({game: game});
      parser.parse(sceneNode)
      .then(function(level) {
        expect(level).to.be.a(Game.Scene);
        level.world.objects.forEach(function(object) {
          expect(object.position.x).to.be.a('number');
          expect(object.position.y).to.be.a('number');
          expect(object.position.z).to.be.a('number');
          if (object.model) {
            expect(object.model.material.map).to.be.a(THREE.Texture);
          }
        });
        level.world.scene.children.forEach(function(mesh) {
          if (mesh.material && !mesh.material.map) {
            console.error('Mesh missing texture', mesh);
          }
        });
        expect(level.camera.smoothing).to.be.a('number');
        done();
      })
      .catch(done);
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