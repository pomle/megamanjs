'use strict';

const sinon = require('sinon');
const THREE = require('three');

function WebGLRendererMock()
{
  this.render = sinon.spy();
}

function mock()
{
  sinon.stub(THREE, 'WebGLRenderer', WebGLRendererMock);
}

function clean()
{
  THREE.WebGLRenderer.restore();
}

module.exports = {
  mock,
  clean,
  WebGLRenderer: WebGLRendererMock,
};