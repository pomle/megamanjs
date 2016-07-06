'use strict';

const sinon = require('sinon');

function AudioContextMock()
{
  this.createBufferSource = function() {
    return new BufferSourceMock();
  };
}

function BufferSourceMock()
{
  this.fakeId = 'a2b62ce4-3217-11e6-9ca3-1040f388afa6';
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