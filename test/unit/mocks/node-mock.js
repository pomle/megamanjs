'use strict';

const sinon = require('sinon');

function NodeMock()
{
  this.querySelector = sinon.spy(function() {
    return new NodeMock;
  });
  this.classList = new Set;
  this.dataset = {};
  this.style = {};
}

module.exports = NodeMock;
