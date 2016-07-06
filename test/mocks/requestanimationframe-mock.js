'use strict';

const sinon = require('sinon');

let frameId = 0;
let time = 0;
let callbacks = [];

function mock()
{
  reset();
  global.requestAnimationFrame = _interface.requestAnimationFrame;
  global.cancelAnimationFrame = _interface.cancelAnimationFrame;
}

function clean()
{
  delete global.requestAnimationFrame;
  delete global.cancelAnimationFrame;
}

function reset()
{
  frameId = 0;
  time = 0;
  callbacks = [];

  _interface.requestAnimationFrame = sinon.spy(function(callback) {
    callbacks.push(callback);
    return frameId;
  });

  _interface.cancelAnimationFrame = sinon.spy(function(frameId) {
    callbacks = [];
  });
}

function triggerAnimationFrame(millis) {
  frameId++;
  const iterate = callbacks;
  callbacks = [];
  iterate.forEach(callback => {
    callback(millis);
  });
}

const _interface = {
  mock,
  clean,
  reset,
  triggerAnimationFrame,
}

module.exports = _interface;