'use strict';

const sinon = require('sinon');

const env = require('./env');
const xmlReader = require('./xmlreader');
const LevelParser = env.Engine.Loader.XML.LevelParser;

function loadLevel(levelName) {
  global.AudioContext = function() {};
  global.Image = function() {};
  sinon.stub(env.THREE, 'WebGLRenderer');

  const loaderMock = {
    game: new env.Game(),
    resource: new env.Engine.ResourceManager(),
  };

  loaderMock.resource.get = function(type) {
    if (type === 'font') {
      return function() {
        return new env.Engine.BitmapFont.Text(
          new env.THREE.Texture(), {x:0, y:0}, {x:0, y:0});
      };
    } else {
      return new env.Engine.Object();
    }
  }

  const xml = xmlReader.readXml(__dirname +
    '/../src/resource/levels/' + levelName + '.xml');

  const node = xml.getElementsByTagName('scene')[0];
  const levelParser = new LevelParser(loaderMock, node);

  const promise = levelParser.getScene();

  delete global.AudioContext;
  delete global.Image;
  env.THREE.WebGLRenderer.restore();

  return promise;
}

module.exports = {
  loadLevel: loadLevel,
};
