'use strict';

const expect = require('expect.js');
const sinon = require('sinon');
const fs = require('fs');

const env = require('../../env.js');
const DOMParser = require('xmldom').DOMParser;
const ResourceManager = env.Game.ResourceManager;
const ObjectParser = env.Game.Loader.XML.Parser.ObjectParser;
const World = env.Engine.World;
const Vector2 = env.THREE.Vector2;

function createNode(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  return doc.childNodes[0];
}

function loadXml(file) {
  const xml = fs.readFileSync(file, 'utf8');
  return createNode(xml);
}

function measureJump(object) {
  const step = 1/120;
  const distance = new Vector2(0, 0);

  object.moveTo(distance);
  object.jump._ready = true;

  const world = new World();
  world.addObject(object);

  expect(object.jump.engage()).to.be(true);

  let iterations = 120;
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
  let parser;

  before(function() {
    const rm = new ResourceManager();

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
    let enemy;
    it('should be created from XML', function() {
      const xml = loadXml(__dirname + '/../../../src/game/resource/characters/SniperArmor.xml');
      const ret = parser.parse(xml);
      expect(ret).to.have.property('SniperArmor');
      enemy = new ret['SniperArmor']();
    });
    it('should jump 33 units high and 66 units far', function() {
      const distance = measureJump(enemy);
      expect(distance.y).to.be.within(32.9, 33.1);
      expect(distance.x).to.be.within(65.5, 66.5);
    });
  });
});
