'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const {PlaneGeometry} = require('three');
const UVAnimator = require('../../src/engine/animator/UV');
const Animation = require('../../src/engine/Animation');
const UVCoords = require('../../src/engine/UVCoords');

describe('UV Animator', () => {
  let animator;
  beforeEach(() => {
    animator = new UVAnimator;
  });

  describe('on instantiation', () => {
    it('has empty name', () => {
      expect(animator.name).to.be('');
    });

    it('has offset set to zero', () => {
      expect(animator.offset).to.be(0);
    });

    it('has time set to zero', () => {
      expect(animator.time).to.be(0);
    });

    it('has as empty geometries array', () => {
      expect(animator.geometries).to.be.an('array');
      expect(animator.geometries).to.have.length(0);
    });

    it('has one index that is zero', () => {
      expect(animator.indices).to.be.an('array');
      expect(animator.indices).to.eql([0]);
    });
  });

  describe('#addGeometry()', () => {
    describe('when called with geometry as argument', () => {
      let geo;
      beforeEach(() => {
        geo = new PlaneGeometry(15, 13);
        animator.addGeometry(geo);
      });

      it('adds a geometry to geometries array', () => {
        expect(animator.geometries).to.have.length(1);
        expect(animator.geometries[0]).to.be(geo);
      });
    });

    describe('when called with invalid geometry', () => {
      it('throws an exception', () => {
        expect(() => {
          animator.addGeometry(1);
        }).to.throwError();
      });
    });
  });

  describe('when set up with two geometries', () => {
    let animator, geos;
    beforeEach(() => {
      geos = [
        new PlaneGeometry(10, 10, 2, 2),
        new PlaneGeometry(5, 5, 2, 2),
      ];

      animator = new UVAnimator;
      animator.addGeometry(geos[0]);
      animator.addGeometry(geos[1]);
    });

    describe('and animation with two frames is set', () => {
      let animation;
      let uvs;
      beforeEach(() => {
        uvs = [
          new UVCoords({x: 0, y: 0}, {x: 5, y: 5}, {x: 10, y: 10}),
          new UVCoords({x: 5, y: 5}, {x: 5, y: 5}, {x: 10, y: 10}),
        ];
        animation = new Animation('foo', 'group1');
        animation.addFrame(uvs[0], 1);
        animation.addFrame(uvs[1], 3);
        animator.setAnimation(animation);
      });

      describe('#clone()', () => {
        let clone;
        beforeEach(() => {
          animator.offset = 13;
          animator.name = 'clonable';
          animator.indices.push(1, 3);
          clone = animator.clone();
        });

        it('returns a new instance', () => {
          expect(clone).to.not.be(animator);
        });

        it('clones current animation', () => {
          expect(clone._currentAnimation).to.be(animation);
        });

        it('clones current index', () => {
          expect(clone._currentIndex).to.be(null);
        });

        it('clones current group', () => {
          expect(clone._currentGroup).to.be('group1');
        });

        it('clones index array', () => {
          expect(clone.indices).to.eql([0, 1, 3]);
        });

        it('clones offset', () => {
          expect(clone.offset).to.be(13);
        });

        it('clones name', () => {
          expect(clone.name).to.be('clonable');
        });

        it('copies geometries', () => {
          expect(clone.geometries).to.have.length(2);
          expect(clone.geometries[0]).to.be(animator.geometries[0]);
          expect(clone.geometries[1]).to.be(animator.geometries[1]);
        });
      });

      describe('#update()', () => {
        describe('when called with 3 seconds', () => {
          beforeEach(() => {
            geos[0].uvsNeedUpdate = false;
            geos[1].uvsNeedUpdate = false;
            animator.update(3);
          });

          it('updates geometry face index to values of seconds frame', () => {
            expect(geos[0].faceVertexUvs[0][0]).to.be(uvs[1][0]);
            expect(geos[0].faceVertexUvs[0][1]).to.be(uvs[1][1]);
            expect(geos[1].faceVertexUvs[0][0]).to.be(uvs[1][0]);
            expect(geos[1].faceVertexUvs[0][1]).to.be(uvs[1][1]);
          });

          it('marks geometry for update', () => {
            expect(geos[0].uvsNeedUpdate).to.be(true);
            expect(geos[1].uvsNeedUpdate).to.be(true);
          });

          describe('then called with another .5 seconds', () => {
            beforeEach(() => {
              geos[0].uvsNeedUpdate = false;
              geos[1].uvsNeedUpdate = false;
              animator.update(.5);
            });

            it('does not mark geometry for update', () => {
              expect(geos[0].uvsNeedUpdate).to.be(false);
              expect(geos[1].uvsNeedUpdate).to.be(false);
            });

            describe('then called with another .5 seconds', () => {
              beforeEach(() => {
                geos[0].uvsNeedUpdate = false;
                geos[1].uvsNeedUpdate = false;
                animator.update(.5);
              });

              it('marks geometry for update again', () => {
                expect(geos[0].uvsNeedUpdate).to.be(true);
                expect(geos[1].uvsNeedUpdate).to.be(true);
              });
            });
          });
        });
      });
    });


  });
});
