const sinon = require('sinon');
const Events = require('../../src/engine/Events');

function NodeMock()
{
  this._attributes = {};
  this._boundingClientRect = {};
  this._children = [];
  this._events = new Events(this);
  this._queries = [];

  this.addEventListener = sinon.spy((name, callback) => {
    this._events.bind(name, callback);
  });

  this.removeEventListener = sinon.spy((name, callback) => {
    this._events.unbind(name, callback);
  });

  this.removeAttribute = sinon.spy((name) => {
    delete this._attributes[name];
  });

  this.appendChild = sinon.spy((element) => {
    this._children.push(element);
  });

  this.getBoundingClientRect = sinon.spy(() => {
    return this._boundingClientRect;
  });

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

NodeMock.prototype.getEvents = function()
{
  return this._events;
}


NodeMock.prototype.getQueries = function()
{
  return this._queries;
}

NodeMock.prototype.setBoundingClientRect = function(rect)
{
  this._boundingClientRect = rect;
}


NodeMock.prototype.triggerEvent = function(name, event)
{
  this._events.trigger(name, [event]);
}

module.exports = NodeMock;
