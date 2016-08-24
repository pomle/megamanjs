'use strict';

const sinon = require('sinon');

function CanvasMock() {
  this.height = 0;
  this.width = 0;

  this._data = {
    data: null
  };

  this._context = {
    imageSmoothingEnabled: false,
    drawImage: sinon.spy(),
    getImageData: sinon.spy((x, y, w, h) => {
      if (!this._data.data) {
        this._data.data = new Uint8ClampedArray(w * h * 4);
      }
      return this._data;
    }),
    putImageData: sinon.spy((data, x, y) => {
      this._data = data;
    }),
  };

  this.getContext = sinon.spy(type => {
    if (type === '2d') {
      return this._context;
    }
    throw new TypeError('CanvasMock.getContext() called with unsupported argument ' + type);
  });
}

CanvasMock.createElement = sinon.spy(function(tag) {
  if (tag === 'canvas') {
    return new CanvasMock;
  }
});

module.exports = CanvasMock;
