const expect = require('expect.js');
const sinon = require('sinon');

const Animation = require('../../src/engine/Animation');
const Timeline = require('../../src/engine/Timeline');

describe('Animation', () => {
  describe('on instantiation', () => {
    let animation;
    before(() => {
      animation = new Animation('foo');
    });

    it('has length 0', () => {
      expect(animation.length).to.be(0);
    });

    it('honors id in constructor', () => {
      expect(animation.id).to.be('foo');
    });

    it('has no group set', () => {
      expect(animation.group).to.be(null);
    });
  });

  describe('when instantiated', () => {
    let animation;
    beforeEach(() => {
      animation = new Animation('foo');
    });

    describe('#addFrame()', () => {
      describe('when called once', () => {
        beforeEach(() => {
          animation.addFrame('A', 1.13);
        });

        it('does not instantiate a timeline', () => {
          expect(animation.timeline).to.be(null);
        });

        describe('#getIndex()', () => {
          it('returns 0 for any input', () => {
            expect(animation.getIndex(1)).to.be(0);
            expect(animation.getIndex(0)).to.be(0);
            expect(animation.getIndex(12515212)).to.be(0);
          });
        });

        describe('#getValue()', () => {
          it('returns only value for any input', () => {
            expect(animation.getValue(0)).to.be('A');
            expect(animation.getValue(1)).to.be('A');
          });
        });

        describe('and then when called again', () => {
          beforeEach(() => {
            animation.addFrame('B', 1.31);
          });

          it('instantiates a timeline', () => {
            expect(animation.timeline).to.be.a(Timeline);
          });

          describe('#getIndex()', () => {
            it('returns 0 for time < 1.13', () => {
              expect(animation.getIndex(1)).to.be(0);
              expect(animation.getIndex(0)).to.be(0);
              expect(animation.getIndex(1.12999999)).to.be(0);
            });

            it('returns 1 for time >= 1.13 but less than 2.44', () => {
              expect(animation.getIndex(1.13)).to.be(1);
              expect(animation.getIndex(2.43)).to.be(1);
            });

            it('returns 0 for time > 2.43', () => {
              expect(animation.getIndex(2.44)).to.be(0);
            });
          });

          describe('#getValue()', () => {
            it('returns correct value for index 0', () => {
              expect(animation.getValue(0)).to.be('A');
            });

            it('returns correct value for index 1', () => {
              expect(animation.getValue(1)).to.be('B');
            });
          });

          describe('then each following call', () => {
            const labels = 'CDEFGHIJK'.split('');
            beforeEach(() => {
              labels.forEach((label, index) => {
                animation.addFrame(label, index + 1);
              });
            });

            it('adds frames to timeline', () => {
              expect(animation.timeline.frames).to.have.length(11);
            });

            it('updates animation length', () => {
              expect(animation.length).to.be(11);
            });

            it('is added in given order', () => {
              expect(animation.getValue(
                animation.getIndex(3)
              )).to.be('C');

              expect(animation.getValue(
                animation.getIndex(4)
              )).to.be('D');

              expect(animation.getValue(
                animation.getIndex(10)
              )).to.be('F');

              expect(animation.getValue(
                animation.getIndex(47)
              )).to.be('K');
            });
          });
        });
      });
    });
  });
});
