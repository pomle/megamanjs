'use strict';

const sinon = require('sinon');

function NodeMock()
{
  this._queries = [];

  this.querySelector = sinon.spy(selector => {
    const node = new NodeMock;
    this._queries.push({
      selector,
      node,
    });
    return node;
  });
  this.classList = new Set;
  this.classList.remove = this.classList.delete;
  this.dataset = {};
  this.style = {};
}

NodeMock.prototype.getQueries = function()
{
  return this._queries;
}

module.exports = NodeMock;
