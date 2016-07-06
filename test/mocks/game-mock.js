'use strict';

const sinon = require('sinon');

const env = require('../env');
const Game = env.Game;

function createGameMock()
{
  global.AudioContext = sinon.spy();
  sinon.stub(THREE, 'WebGLRenderer');

  const game = new Game;

  THREE.WebGLRenderer.restore();
  delete global.AudioContext;

  return game;
}

module.exports = createGameMock;
