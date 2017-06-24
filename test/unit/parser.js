const expect = require('expect.js');
const sinon = require('sinon');
const fs = require('fs');

const THREE = require('three');
const xmlReader = require('../xmlreader');

const World = require('../../src/engine/World');
const ResourceManager = require('../../src/engine/ResourceManager');
const Obj = require('../../src/engine/Object');
const Parser = require('../../src/engine/loader/XML/Parser');
const ObjectParser = require('../../src/engine/loader/XML/ObjectParser');
const LevelParser = require('../../src/engine/loader/XML/LevelParser');
const TraitParser = require('../../src/engine/loader/XML/TraitParser');

function createNode(x) {
  return xmlReader.createNode(x).childNodes[0];
}

function getNode(name) {
  return xmlReader.readXml(__dirname + '/fixtures/' + name + '.xml', 'utf8').childNodes[0];
}

describe('Parser', function() {
  let loaderMock;

  beforeEach(function() {
    loaderMock = {
      resource: new ResourceManager(),
    };

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
      const parser = new Parser();
      const node = createNode('<moot/>');
      expect(parser.getAttr(node, 'foo')).to.be(null);
    });
    it('should return string if attribute set', function() {
      const parser = new Parser();
      const node = createNode('<moot foo="bar"/>');
      expect(parser.getAttr(node, 'foo')).to.equal("bar");
    });
    it('should return null if attribute empty', function() {
      const parser = new Parser();
      const node = createNode('<moot foo=""/>');
      expect(parser.getAttr(node, 'foo')).to.equal(null);
    });
  });

  context('#getColor', function() {
    let node, parser;
    it('should parse an RGB color', function() {
      parser = new Parser();
      node = createNode('<node color=".13,.37,.54"/>');
      const color = parser.getColor(node);
      expect(color).to.eql({r: 0.13, g: 0.37, b: 0.54});
    });

    it('should default non-defined to 1', function() {
      node = createNode('<node color=".13,,.54"/>');
      const color = parser.getColor(node);
      expect(color).to.eql({r: 0.13, g: 1, b: 0.54});
    });

    it('should support custom attribute', function() {
      node = createNode('<node moot=".13,,.54"/>');
      const color = parser.getColor(node, 'moot');
      expect(color).to.eql({r: 0.13, g: 1, b: 0.54});
    });
  });

  context('#getColorHex', function() {
    let node, parser;
    it('should parse a hex-color', function() {
      parser = new Parser();
      node = createNode('<node color="#ff06a0"/>');
      const color = parser.getColorHex(node);
      expect(color).to.eql({x: 255, y: 6, z: 160});
    });

    it('should support custom attribute', function() {
      node = createNode('<node moot="#ff06a0"/>');
      const color = parser.getColorHex(node, 'moot');
      expect(color).to.eql({x: 255, y: 6, z: 160});
    });
  });

  context('#getRange', function() {
    let node, range, parser;
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
      const parser = new Parser();
      let node;
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
      const parser = new Parser();
      const node = createNode('<moot x="13" y="17" />');
      expect(parser.getVector2(node)).to.eql({x: 13, y: 17});
    });
    it('should allow attribute key substitution', function() {
      const parser = new Parser();
      let node;
      node = createNode('<moot w="10" h="12"/>');
      expect(parser.getVector2(node, 'w', 'h')).to.eql({x: 10, y: 12});
    });
  });

  context('#getVector3', function() {
    it('should return null if x or y missing', function() {
      const parser = new Parser();
      let node;
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
      const parser = new Parser();
      const node = createNode('<moot x="13" y="17" z="11" />');
      expect(parser.getVector3(node)).to.eql({x: 13, y: 17, z: 11});
    });
    it('should default z to 0 if not available', function() {
      const parser = new Parser();
      const node = createNode('<moot x="13" y="17"/>');
      expect(parser.getVector3(node)).to.eql({x: 13, y: 17, z: 0});
    });
    it('should allow attribute key substitution', function() {
      const parser = new Parser();
      let node;
      node = createNode('<moot w="10" h="12" r="5"/>');
      expect(parser.getVector3(node, 'w', 'h', 'r')).to.eql({x: 10, y: 12, z: 5});
    });
    it('should parse shorthand version if one attribute key supplied', function() {
      const parser = new Parser();
      let node;
      node = createNode('<moot to="1.13,1.19,1.23"/>');
      expect(parser.getVector3(node, 'to')).to.eql({x: 1.13, y: 1.19, z: 1.23});
    });
    context('when parsing shorthand version', function() {
      it('should set unspecified values to undefined', function() {
        const parser = new Parser();
        let node;
        node = createNode('<moot to=",1.19,"/>');
        expect(parser.getVector3(node, 'to')).to.eql({x: undefined, y: 1.19, z: undefined});
        node = createNode('<moot to="1.13,,"/>');
        expect(parser.getVector3(node, 'to')).to.eql({x: 1.13, y: undefined, z: undefined});
        node = createNode('<moot to=",,1.14"/>');
        expect(parser.getVector3(node, 'to')).to.eql({x: undefined, y: undefined, z: 1.14});
      });
      it('should not misinterpret 0 as undefined', function() {
        const parser = new Parser();
        let node;
        node = createNode('<moot to="0,1,"/>');
        expect(parser.getVector3(node, 'to')).to.eql({x: 0, y: 1, z: undefined});
      });
    });
  });

  /*
  describe('for Objects', function() {
    describe('#parse', function() {
      let objects, character;
      it('should return an object indexed by object names', function() {
        const objectsNode = getNode('character');
        const parser = new ObjectParser(loaderMock);
        objects = parser.parse(objectsNode);
        expect(objects).to.be.an(Object);
        expect(objects).to.have.property('Megaman');
      });
      it('should provide a constructor for object', function() {
        character = new objects['Megaman'];
        expect(character).to.be.a(Engine.objects.Character);
      });
      context('Animations', function() {
        it('should have correct UV maps', function() {
          expect(character.animations['idle']).to.be.an(Engine.Animator.Animation);
          const uvs = character.animations['idle'].getValue(0);
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
        it('should have group set to undefined if not specified', function() {
          expect(character.animations['idle'].group).to.be(undefined);
        });
        it('should have group set to string if specified', function() {
          expect(character.animations['run'].group).to.be('run');
          expect(character.animations['run-fire'].group).to.be('run');
        });
      });
      it('should have default animation on construction', function() {
        const uvs = character.animations['__default'].getValue(0);
        expect(character.model.geometry.faceVertexUvs[0][0]).to.eql(uvs[0]);
        expect(character.model.geometry.faceVertexUvs[0][1]).to.eql(uvs[1]);
      });
      it('should parse animation router', function() {
        expect(character.routeAnimation()).to.be('test-value-is-fubar');
      });
    });
    describe('#parseAnimations', function() {
      const textureMock = {size: {x: 128, y: 128}};
      context('when animation group node has size specified', function() {
        it('should use size from animation group node', function() {
          const node = createNode('<animations w="48" h="44">' +
            '<animation id="moot">' +
              '<frame x="32" y="16"/>' +
            '</animation>' +
          '</animations>');
          const parser = new ObjectParser();
          const frameNode = node.childNodes[0];
          const animation = parser.parseAnimation(frameNode, textureMock);
          expect(animation.getValue()).to.eql(new Engine.UVCoords(
            {x: 32, y: 16},
            {x: 48, y: 44},
            {x: 128, y: 128}));
        });
      });
      context('when animation node has size specified', function() {
        it('should use size from animation node', function() {
          const node = createNode('<animations w="48" h="48">' +
            '<animation id="moot" w="24" h="22">' +
              '<frame x="32" y="16"/>' +
            '</animation>' +
          '</animations>');
          const parser = new ObjectParser();
          const frameNode = node.childNodes[0];
          const animation = parser.parseAnimation(frameNode, textureMock);
          expect(animation.getValue()).to.eql(new Engine.UVCoords(
            {x: 32, y: 16},
            {x: 24, y: 22},
            {x: 128, y: 128}));
        });
      });
      context('when frame has size specified', function() {
        it('should use size from frame', function() {
          const node = createNode('<animations w="48" h="48">' +
            '<animation id="moot" w="24" h="22">' +
              '<frame x="32" y="16" w="12" h="11"/>' +
            '</animation>' +
          '</animations>');
          const parser = new ObjectParser();
          const frameNode = node.childNodes[0];
          const animation = parser.parseAnimation(frameNode, textureMock);
          expect(animation.getValue()).to.eql(new Engine.UVCoords(
            {x: 32, y: 16},
            {x: 12, y: 11},
            {x: 128, y: 128}));
        });
      });
      context('when wrapped in <loop>', function() {
        it('should duplicate a single frame', function() {
          const node = createNode('<animations w="48" h="48">' +
            '<animation id="moot" w="24" h="22">' +
              '<loop count="13">' +
                '<frame x="32" y="16" duration="1"/>' +
              '</loop>' +
            '</animation>' +
          '</animations>');
          const parser = new ObjectParser();
          const animation = parser.parseAnimation(node.childNodes[0], textureMock);
          expect(animation.length).to.be(13);
        });
        it('should duplicate mixed frames', function() {
          const node = createNode('<animations w="48" h="48">' +
            '<animation id="moot" w="20" h="10">' +
              '<frame x="1" y="1" duration="13"/>' +
              '<frame x="1" y="1" duration="19"/>' +
              '<loop count="2">' +
                '<frame x="1" y="1" duration="1"/>' +
                '<frame x="2" y="2" duration="2"/>' +
              '</loop>' +
              '<frame x="3" y="3" duration="16"/>' +
              '<frame x="4" y="4" duration="8"/>' +
              '<loop count="3">' +
                '<frame x="5" y="5" duration="4"/>' +
              '</loop>' +
              '<frame x="6" y="6" duration="8"/>' +
            '</animation>' +
          '</animations>');
          const parser = new ObjectParser();
          const animation = parser.parseAnimation(node.childNodes[0], textureMock);
          const frames = animation.timeline.frames;
          expect(animation.length).to.be(12);
          let f = 0;
          expect(frames[f++].duration).to.be(13);
          expect(frames[f++].duration).to.be(19);
          expect(frames[f++].duration).to.be(1);
          expect(frames[f++].duration).to.be(2);
          expect(frames[f++].duration).to.be(1);
          expect(frames[f++].duration).to.be(2);
          expect(frames[f++].duration).to.be(16);
          expect(frames[f++].duration).to.be(8);
          expect(frames[f++].duration).to.be(4);
          expect(frames[f++].duration).to.be(4);
          expect(frames[f++].duration).to.be(4);
          expect(frames[f++].duration).to.be(8);
        });
      });
      it('should parse an animation node', function() {
        const node = getNode('animations');
        const parser = new ObjectParser();
        const animations = parser.parseAnimations(node,
                                                {foo: {size: {x: 256, y: 256}}});
        const animation = animations['__default'];
        expect(animation).to.be.a(Engine.Animator.Animation);
        expect(animation.id).to.equal('idle');
        expect(animation.length).to.equal(2);
        const uvs = animation.getValue(0);
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
      let textures, character;
      it('should return an object indexed by texture names', function() {
        const texturesNode = getNode('textures');
        const parser = new ObjectParser(loaderMock);
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
    let level;
    it('should parse a level', function(done) {
      const resourceMock = new Engine.ResourceManager();
      resourceMock.get = sinon.spy(function(type, id) {
        if (type === 'font') {
          return function() {
            return {
              createMesh: sinon.spy(),
            }
          };
        } else {
          return Obj;
        }
      });
      const game = new Game();
      game.player = new Engine.Player();
      const sceneNode = getNode('level');
      const parser = new LevelParser({
        game: game,
        resource: resourceMock,
      });
      parser.parse(sceneNode)
      .then(function(_level) {
        level = _level;
        expect(level).to.be.a(Engine.Scene);
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
      let object;
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
        expect(level.world.camera.smoothing).to.be.a('number');
        expect(level.world.camera.smoothing).to.equal(13.5);
      });
      it('should have paths', function() {
        const paths = level.world.camera.paths;
        expect(paths).to.have.length(3);
        expect(paths[0].window[0]).to.eql({x: 0, y: -208, z: 0});
        expect(paths[0].window[1]).to.eql({x: 2048, y: 0, z: 0});
        expect(paths[0].constraint[0]).to.eql({x: 180, y: -120, z: 150});
        expect(paths[0].constraint[1]).to.eql({x: 1920, y: -120, z: 150});
      });
    });
  });
  describe('for Traits', function() {
    const parser = new TraitParser({
        resource: new Engine.ResourceManager(),
    });
    context('when parsing by default scheme', function() {
      it('should prefer parsing floats', function() {
        const node = createNode('<trait source="Fallaway" test1="0" test2="13.12" test3="ab" test4="-124.0"/>');
        const Trait = parser.parseTrait(node);
        const trait = new Trait();
        expect(trait.test1).to.equal(0);
        expect(trait.test2).to.equal(13.12);
        expect(trait.test3).to.equal('ab');
        expect(trait.test4).to.equal(-124.0);
      });
    });
    describe('Door', function() {
      context('when parsing defaults', function() {
        const node = createNode('<trait source="Door"/>');
        const Trait = parser.parseTrait(node);
        it('should inherit Door trait', function() {
          expect(new Trait).to.be.a(Engine.traits.Door);
        });
        it('should default to universal direction', function() {
          const trait = new Trait();
          expect(trait.direction).to.eql({x: 0, y: 0});
        });
        it('should default to two way', function() {
          const trait = new Trait();
          expect(trait.oneWay).to.be(false);
        });
      });
      it('should parse direction', function() {
        const node = createNode('<trait source="Door"><direction x="13" y="1../trait>');
        const Trait = parser.parseTrait(node);
        const trait = new Trait();
        expect(trait.direction).to.be.eql({x: 13, y: 17});
      });
      it('should parse one-way', function() {
        const node = createNode('<trait source="Door" one-way="true"/>');
        const Trait = parser.parseTrait(node);
        const trait = new Trait();
        expect(trait.oneWay).to.be(true);
      });
    });
    describe('Solid', function() {
      context('when instantiating', function() {
        const trait = new Engine.traits.Solid();
        it('should have name set to "solid"', function() {
          expect(trait.NAME).to.be('solid');
        });
        it('should have fixed set to false', function() {
          expect(trait.fixed).to.be(false);
        });
      });
      context('when no attack attribute set', function() {
        it('should default to all surfaces', function() {
          const node = createNode('<trait source="Solid"/>');
          const Trait = parser.parseTrait(node);
          const trait = new Trait();
          expect(trait.attackAccept).to
            .eql([trait.TOP, trait.BOTTOM, trait.LEFT, trait.RIGHT]);
        });
      });
      context('when attack attribute set', function() {
        it('should honor attribute', function() {
          const node = createNode('<trait source="Solid" attack="top"/>');
          const Trait = parser.parseTrait(node);
          const trait = new Trait();
          expect(trait.attackAccept).to.eql([trait.TOP]);
        });
        it('should parse using space-separated', function() {
          const node = createNode('<trait source="Solid" attack="bottom left right"/>');
          const Trait = parser.parseTrait(node);
          const trait = new Trait();
          expect(trait.attackAccept).to.eql([trait.BOTTOM, trait.LEFT, trait.RIGHT]);
        });
      });
    });
    describe('Spawn', function() {
      let spawn;
      let hostMock;
      beforeEach(function() {
        hostMock = {
          position: {x: 3, y: 5, z: 0},
          world: {
            addObject: sinon.spy(),
          },
        };
      });

      it('should discover a single item', function() {
        parser.loader.resource.addObject('Explosion', Obj);
        const node = createNode('<trait source="Spawn"><item event="recycle" object="Explosio../trait>');
        const Spawn = parser.parseTrait(node);
        spawn = new Spawn();
        expect(spawn._conditions).to.have.length(1);
      });
      it('should discover multiple items', function() {
        const node = createNode('<trait source="Spawn">' +
          '<item event="recycle" object="Explosion"/>' +
          '<item event="blast" object="Explosion">' +
            '<offset x="13" y="11" z="5"/>' +
          '</item>' +
        '</trait>');
        const Spawn = parser.parseTrait(node);
        spawn = new Spawn();
        expect(spawn._conditions).to.have.length(2);
      });
      it('should provide a default offset', function() {
        spawn._conditions[0].callback.call(hostMock);
        expect(hostMock.world.addObject.callCount).to.be(1);
        const spawned = hostMock.world.addObject.lastCall.args[0];
        expect(spawned).to.be.a(Obj);
        expect(spawned.position).to.eql({x: 3, y: 5, z: 0});
      });
      it('should honor parsed offset', function() {
        spawn._conditions[1].callback.call(hostMock);
        expect(hostMock.world.addObject.callCount).to.be(1);
        const spawned = hostMock.world.addObject.lastCall.args[0];
        expect(spawned).to.be.a(Obj);
        expect(spawned.position).to.eql({x: 3 + 13, y: 5 + 11, z: 0 + 5});
      });
    });
  });*/
});
