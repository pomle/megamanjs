const expect = require('expect.js');
const sinon = require('sinon');

const {Entity} = require('@snakesilk/engine');
const Megaman = require('../Megaman');

describe('Megaman', () => {
  describe('on instantiation', () => {
    let instance;

    beforeEach(() => {
      instance = new Megaman();
    });

    it('is an instance of entity', () => {
      expect(instance).to.be.a(Entity);
    });

    describe('#changeDress', () => {
      beforeEach(() => {
        sinon.stub(instance, 'useTexture');
        instance.changeDress({code: 'm'});
      });

      it('calls #useTexture once', () => {
        expect(instance.useTexture.callCount).to.be(1);
      });

      it('calls #useTexture using textureId based on code from weapon', () => {
        expect(instance.useTexture.lastCall.args[0]).to.be('megaman-m');
      });
    })
  });
});
