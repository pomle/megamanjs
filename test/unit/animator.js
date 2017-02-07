'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const Animator = require('../../src/engine/Animator');
const Animation = require('../../src/engine/Animation');

describe('Animator', () => {
  function createAnimator() {
    const anim = new Animator;
    sinon.stub(anim, '_applyAnimation', function(animation) {
      this._currentIndex = animation.getIndex();
    });
    return anim;
  }

  describe('on instantiation', () => {
    let animator;
    before(() => {
      animator = createAnimator();
    });

    it('has empty name', () => {
      expect(animator.name).to.be('');
    });

    it('has offset set to zero', () => {
      expect(animator.offset).to.be(0);
    });

    it('has time set to zero', () => {
      expect(animator.time).to.be(0);
    });
  });

  describe('#reset()', () => {
    it('resets time to offset', () => {
      const animator = new Animator;
      animator.offset = 13.37;
      expect(animator.time).to.be(0);
      animator.reset();
      expect(animator.time).to.be(13.37);
    });
  });

  describe('when animation already set', () => {
    let animator;
    let animations = [];
    beforeEach(() => {
      animator = createAnimator();
      animations = [
        new Animation('A', 'group1'),
        new Animation('B', 'group1'),
        new Animation('C', 'group2'),
      ];
      animator.setAnimation(animations[0]);
    });

    describe('and update() is called without time', () => {
      beforeEach(() => {
        animator.update();
      });

      it('time is unchanged', () => {
        expect(animator.time).to.be(0);
      });

      it('_applyAnimation is called with set animation', () => {
        expect(animator._applyAnimation.callCount).to.be(1);
        expect(animator._applyAnimation.lastCall.args[0]).to.be(animations[0]);
      });
    });

    describe('and update() is called with time', () => {
      beforeEach(() => {
        animator.update(1.13);
        animator.update(3.12);
      });

      it('time is accumulated', () => {
        expect(animator.time).to.be(4.25);
      });

      it('_applyAnimation is called with set animation', () => {
        expect(animator._applyAnimation.callCount).to.be(2);
        expect(animator._applyAnimation.getCall(0).args[0])
          .to.be(animations[0]);
          expect(animator._applyAnimation.getCall(1).args[0])
          .to.be(animations[0]);
      });
    });

    describe('and time is non-zero', () => {
      beforeEach(() => {
        animator.update(1.13);
      });

      describe('and setAnimation()', () => {
        describe('called with same animation', () => {
          beforeEach(() => {
            animator.setAnimation(animations[0]);
          });

          it('time is kept', () => {
            expect(animator.time).to.be(1.13);
          });

          it('index is kept', () => {
            expect(animator._currentIndex).to.be(0);
          });
        });

        describe('called with other animation of same group', () => {
          beforeEach(() => {
            animator.setAnimation(animations[1]);
          });

          it('time is kept', () => {
            expect(animator.time).to.be(1.13);
          });

          it('index is cleared', () => {
            expect(animator._currentIndex).to.be(null);
          });
        });

        describe('called with animation of other group', () => {
          beforeEach(() => {
            animator.setAnimation(animations[2]);
          });

          it('time is reset', () => {
            expect(animator.time).to.be(0);
          });

          it('clears index', () => {
            expect(animator._currentIndex).to.be(null);
          });
        });
      });
    });
  });
});
