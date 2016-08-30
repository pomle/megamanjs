'use strict';

const env = require('../env');
const AudioContextMock = require('./audiocontext-mock');
const WebGLRendererMock = require('./webglrenderer-mock');

const Game = env.Engine.Game;

function createGameMock()
{
  AudioContextMock.mock();
  WebGLRendererMock.mock();

  const game = new Game;

  AudioContextMock.clean();
  WebGLRendererMock.clean();

  return game;
}

module.exports = createGameMock;
