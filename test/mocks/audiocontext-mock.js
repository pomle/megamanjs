'use strict';

const sinon = require('sinon');

function AudioContextMock()
{
  this.createBufferSource = function() {
    return new BufferSourceMock();
  };
  this.resume = sinon.spy();
}

function BufferSourceMock()
{
  this.addEventListener = sinon.spy();
  this.connect = sinon.spy();
  this.buffer = null;
  this.playbackRate = {
    value: 1,
  };
  this.start = sinon.spy();
  this.stop = sinon.spy();
}

function mock()
{
  global.AudioContext = AudioContextMock;
}

function clean()
{
  delete global.AudioContext;
}

module.exports = {
  mock,
  clean,
  AudioContext: AudioContextMock,
  BufferSource: BufferSourceMock,
};