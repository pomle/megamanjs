'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env.js');

const CanvasUtil = env.Engine.CanvasUtil;

describe('CanvasUtil', function() {
  function setupMocks()
  {
    const Canvas = function() {
      this.height = 0;
      this.width = 0;

      this._data = {data: null};
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
      }

      this.getContext = sinon.spy(type => {
        if (type === '2d') {
          return this._context;
        }
      });
    }

    const document = {
      createElement: sinon.spy(function(tag) {
        if (tag === 'canvas') {
          return new Canvas;
        }
      }),
    }

    global.document = document;
  }
  function teardownMocks()
  {
    delete global.document;
  }

  describe('#clone()', function() {
    it('should clone a canvas', function() {
      setupMocks();
      const source = document.createElement('canvas');
      source.width = 321;
      source.height = 223;
      const clone = CanvasUtil.clone(source);
      expect(clone.getContext('2d').drawImage.calledOnce).to.be(true);
      expect(clone.getContext('2d').drawImage.lastCall.args[0]).to.be(source);
      expect(clone.getContext('2d').drawImage.lastCall.args[1]).to.be(0);
      expect(clone.getContext('2d').drawImage.lastCall.args[2]).to.be(0);
      expect(clone.width).to.be(321);
      expect(clone.height).to.be(223);
      teardownMocks();
    });
  });

  describe('#colorReplace()', function() {
    it('should use full canvas as workspace', function() {
      setupMocks();
      const col1 = {x: 255, y: 255, z: 255};
      const col2 = {x: 255, y: 0, z: 128};
      const canvas = document.createElement('canvas');
      canvas.width = 5;
      canvas.height = 5;
      CanvasUtil.colorReplace(canvas, col1, col2);
      expect(canvas.getContext('2d').getImageData.lastCall.args).to.eql([0, 0, 5, 5]);
      canvas.width = 120;
      canvas.height = 111;
      CanvasUtil.colorReplace(canvas, col1, col2);
      expect(canvas.getContext('2d').getImageData.lastCall.args).to.eql([0, 0, 120, 111]);
      teardownMocks();
    });

    it('should replace a color', function() {
      setupMocks();
      const col1 = {x: 255, y: 255, z: 255};
      const col2 = {x: 255, y: 0, z: 128};
      const canvas = document.createElement('canvas');
      canvas.width = 5;
      canvas.height = 5;
      const context = canvas.getContext('2d');
      let pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      pixels.data[0] = 255;
      pixels.data[1] = 255;
      pixels.data[2] = 255;
      context.putImageData(pixels);

      CanvasUtil.colorReplace(canvas, col1, col2);
      pixels = context.getImageData();
      expect(pixels.data[0]).to.be(255);
      expect(pixels.data[1]).to.be(0);
      expect(pixels.data[2]).to.be(128);
      expect(canvas.getContext('2d').putImageData.lastCall.args).to.eql([pixels, 0, 0]);
      teardownMocks();
    });
  });

  describe('#scale()', function() {
    it('should smooth when scaling down', function() {
      setupMocks();
      const canvas = document.createElement('canvas');
      canvas.width = 12;
      canvas.height = 8;
      const scaled = CanvasUtil.scale(canvas, .5);
      expect(scaled.width).to.be(6);
      expect(scaled.height).to.be(4);
      expect(scaled.getContext('2d').imageSmoothingEnabled).to.be(true);
      teardownMocks();
    });

    it('should not smooth when scaling up', function() {
      setupMocks();
      const canvas = document.createElement('canvas');
      canvas.width = 12;
      canvas.height = 8;
      const scaled = CanvasUtil.scale(canvas, 2);
      expect(scaled.width).to.be(24);
      expect(scaled.height).to.be(16);
      expect(scaled.getContext('2d').imageSmoothingEnabled).to.be(false);
      teardownMocks();
    });

    it('should do canvas scaling', function() {
      setupMocks();
      const canvas = document.createElement('canvas');
      canvas.width = 12;
      canvas.height = 8;
      const scaled = CanvasUtil.scale(canvas, 2);
      const context = scaled.getContext('2d');
      expect(context.drawImage.lastCall.args).to.eql([canvas, 0, 0, 24, 16]);
      teardownMocks();
    });
  });
});
