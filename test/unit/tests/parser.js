var expect = require('expect.js');
var sinon = require('sinon');
var fs = require('fs');

var env = require('../../importer.js');
var Engine = env.Engine;
var DOMParser = require('xmldom').DOMParser;
var ObjectParser = env.Game.Loader.XML.Parser.ObjectParser;

function getNode(name) {
  var xml = fs.readFileSync(__dirname + '/fixtures/' + name + '.xml', 'utf8');
  var parser = new DOMParser();
  var doc = parser.parseFromString(xml, 'text/xml');
  return doc;
}

describe('Parser', function() {
  describe('for Objects', function() {
    describe('#parse', function() {
      var doc = getNode('character');
      var parser = new ObjectParser();
      var textureIndex = 0;
      parser.getTexture = sinon.spy(function() {
        return {
          index: textureIndex++,
        };
      });

      var objects = parser.parse(doc.getElementsByTagName('objects')[0]);
      expect(objects).to.have.property('Megaman');
      var character = new objects['Megaman'];
      console.log(character);


    });
    describe('#parseAnimation', function() {
      it('should parse an animation node', function() {
        var doc = getNode('animations');
        var parser = new ObjectParser();
        var animation = parser.parseAnimation(doc.getElementsByTagName('animation')[0],
                                              {size: {x: 100, y: 100}});
        console.log(animation);
        expect(animation).to.be.a(Engine.Animator.Animation);
        expect(animation.id).to.equal('idle');
        expect(animation.length).to.equal(2);
        expect(animation.getValue(0)).to.be.a(Engine.UVCoords);


      });
    });
  });
});
