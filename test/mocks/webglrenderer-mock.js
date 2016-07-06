'use strict';

const sinon = require('sinon');
const THREE = require('three');

const NodeMock = require('./node-mock');

function WebGLRendererMock()
{
  this.domElement = new NodeMock('canvas');
  this.render = sinon.spy();
  this.setSize = sinon.spy();
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