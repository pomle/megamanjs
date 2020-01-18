const expect = require('expect.js');
const sinon = require('sinon');

const {Object3D} = require('three');
const {Entity, Animation, UVAnimator} = require('@snakesilk/engine');
const Headlight = require('../Headlight');

describe('Headlight', () => {
  let headlight, host;

  describe('on instantiation', () => {
    beforeEach(() => {
      headlight = new Headlight();
    });

    it('has name', () => {
      expect(headlight.NAME).to.be('headlight');
    });

    describe('when applied', () => {
      const MOCK_FLARE_TEXTURE = Symbol('mock flare texture');

      beforeEach(() => {
        host = new Entity();

        host.animators.push(new UVAnimator());
        const runAnim = new Animation();
        runAnim.addFrame('A', .25);
        runAnim.addFrame('B', .25);
        runAnim.addFrame('C', .25);
        runAnim.addFrame('D', .25);
        host.animations.set('run', runAnim);
        host.animations.set('run-shoot', runAnim);

        host.textures.set('headlight_lensflare', {texture: MOCK_FLARE_TEXTURE});
        host.setModel(new Object3D());
        host.applyTrait(headlight);
      });

      it('exposes trait as "headlight"', () => {
        expect(host.headlight).to.be(headlight);
      });

      it('sets flate material to "headlight_lensflare" texture of host', () => {
        expect(host.headlight.flare.material.map).to.be(MOCK_FLARE_TEXTURE);
      });

      describe('Headbob', () => {
        describe('when run animation active', () => {
          let runAnim;

          beforeEach(() => {
            host.setAnimation('run');
          });

          [
            [[0, 2], 7.5],
            [[1, 3], 5.5],
          ].forEach(([frames, bob]) => {
            frames.forEach(frame => {
              describe(`and frame index is ${frame}`, () => {
                beforeEach(() => {
                  host.updateAnimators(frame * .25);
                  host.timeShift(0);
                });

                it(`beam is at ${bob}`, () => {
                  expect(headlight.beam.position.y).to.be(bob);
                });

                it(`point is at ${bob}`, () => {
                  expect(headlight.point.position.y).to.be(bob);
                });
              });
            });
          });
        });
      });
    });
  });
});
