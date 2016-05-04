'use strict';

const env = require('./env');
const xmlReader = require('./xmlreader');
const LevelParser = env.Game.Loader.XML.Parser.LevelParser;

function loadLevel(levelName) {
  global.Image = function() {};

  const loaderMock = {
    game: new env.Game(),
    resource: new env.Game.ResourceManager(),
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

  const levelParser = new LevelParser(loaderMock);

  const xml = xmlReader.readXml(__dirname +
    '/../src/game/resource/levels/' + levelName + '.xml');

  const promise = levelParser.parse(xml.getElementsByTagName('scene')[0]);

  delete global.Image;

  return promise;
}

module.exports = {
  loadLevel: loadLevel,
};