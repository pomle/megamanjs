var expect = require('expect.js');
var sinon = require('sinon');
var fs = require('fs');

var env = require('../../env.js');
var DOMParser = require('xmldom').DOMParser;
var ResourceManager = env.Game.ResourceManager;
var ObjectParser = env.Game.Loader.XML.Parser.ObjectParser;
var World = env.Engine.World;
var Vector2 = env.THREE.Vector2;

function createNode(xml) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(xml, 'text/xml');
  return doc.childNodes[0];
}

function loadXml(file) {
  var xml = fs.readFileSync(file, 'utf8');
  return createNode(xml);
}

function measureJump(object) {
  var step = 1/120;
  var distance = new Vector2(0, 0);

  object.moveTo(distance);
  object.jump._ready = true;

  var world = new World();
  world.addObject(object);

  expect(object.jump.engage()).to.be(true);

  var iterations = 120;
  while (iterations--) {
    world.updateTime(step);
    if (object.position.y < 0) {
      return distance;
    }
    distance.x = object.position.x;
    if (object.position.y > distance.y) {
      distance.y = object.position.y;
    }
  }

  throw new Error('Max height not reached during simulation');
}

describe('Enemies', function() {
  var parser;

  before(function() {
    var rm = new ResourceManager();

    rm._addResource('object', 'TinyExplosion', env.Engine.Object);

    parser = new ObjectParser({
      resource: rm,
    });

    global.Image = function() {};
  });

  after(function() {
    delete global.Image;
  });

  describe('SniperArmor', function() {
    var enemy;
    it('should be created from XML', function() {
      var xml = loadXml(__dirname + '/../../../src/game/resource/characters/SniperArmor.xml');
      var ret = parser.parse(xml);
      expect(ret).to.have.property('SniperArmor');
      enemy = new ret['SniperArmor']();
    });
    it('should jump 33 units high and 66 units far', function() {
      var distance = measureJump(enemy);
      expect(distance.y).to.be.within(32.9, 33.1);
      expect(distance.x).to.be.within(65.5, 66.5);
    });
  });
});
