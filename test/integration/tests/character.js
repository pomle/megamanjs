var expect = require('expect.js');
var sinon = require('sinon');
var fs = require('fs');
var path = require('path');

var DOMParser = require('xmldom').DOMParser;

var env = require('../../env.js');
var Game = env.Game;

var RESOURCE_DIR = path.resolve(__dirname, '../../../src/game/resource');

describe('Game', function() {
  var megaman2;
  before(function() {
    sinon.stub(env.THREE, 'WebGLRenderer', function() {
      this.render = sinon.spy();
    });

    sinon.stub(Game.Loader.XML.prototype, 'asyncLoadXML', function(url) {
      var file = RESOURCE_DIR + '/' + url;
      return new Promise(function(resolve) {
        var text = fs.readFileSync(file, 'utf8');
        var parser = new DOMParser();
        var doc = parser.parseFromString(text, 'text/xml');
        doc.baseURL = file;
        resolve(doc);
      });
    });
  });
  after(function() {
    env.THREE.WebGLRenderer.restore();
    Game.Loader.XML.prototype.asyncLoadXML.restore();
  });

  context('when loading', function() {
    it('should return a game object with a promise', function() {
      megaman2 = Game.Loader.XML.createFromXML('Megaman2.xml');
      expect(megaman2).to.have.property('game');
      expect(megaman2).to.have.property('loader');
      expect(megaman2.promise).to.be.a(Promise);
    });
    it('should fulfil promise when loaded', function(done) {
      megaman2.promise.then(function() {
        done();
      }).catch(done);
    });
    //context('')
  });
});
