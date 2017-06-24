const expect = require('expect.js');
const sinon = require('sinon');

const RandomMock = require('../mocks/math-random-mock');

const THREE = require('three');
const Math = require('../../src/engine/Math');

describe('Math', function() {
  describe('#applyRatio()', function() {
    it('should return value for a ratio between two numbers', function() {
      expect(Math.applyRatio(0, 0, 10)).to.be(0);
      expect(Math.applyRatio(.25, 0, 10)).to.be(2.5);
      expect(Math.applyRatio(.5, 0, 10)).to.be(5);
      expect(Math.applyRatio(.75, 0, 10)).to.be(7.5);
      expect(Math.applyRatio(1, 0, 10)).to.be(10);
      expect(Math.applyRatio(.5, 10, 0)).to.be(5);
      expect(Math.applyRatio(.5, 0, 20)).to.be(10);
      expect(Math.applyRatio(.25, -20, 20)).to.be(-10);
    });
  });

  describe('#clamp()', function() {
    it('should return min value if less', function() {
      expect(Math.clamp(4, 5, 7)).to.be(5);
    });

    it('should return max value if more', function() {
      expect(Math.clamp(8, 5, 7)).to.be(7);
    });

    it('should return initial value if within', function() {
      expect(Math.clamp(6, 5, 7)).to.be(6);
    });
  });

  describe('#findRatio()', function() {
    it('should return ratio between two numbers given center value', function() {
      expect(Math.findRatio(5, 0, 10)).to.be(.5);
      expect(Math.findRatio(5, -10, 10)).to.be(.75);
      expect(Math.findRatio(-10, -10, 10)).to.be(0);
    });
  });


  describe('#nextPowerOf()', function() {
    it('should return the next power of 123 as 128', function() {
      expect(Math.nextPowerOf(123)).to.be(128);
    });

    it('should return the next power of 3 as 4', function() {
      expect(Math.nextPowerOf(3)).to.be(4);
    });

    it('should return the next power of 513 as 1024', function() {
      expect(Math.nextPowerOf(513)).to.be(1024);
    });
  });

  describe('#randStr()', function() {
    beforeEach(function() {
      RandomMock.mock();
    });

    afterEach(function() {
      RandomMock.clean();
    });

    it('should return a random string of 6 chars using safe alpha-num set by default', function() {
      const str = Math.randStr();
      expect(str).to.be('c2jm76');
    });

    it('should return a random string with specified length using supplied chars', function() {
      const str = Math.randStr(32, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
      expect(str).to.be('EtRW42enILLlkpcNqeNDYCNoenoSSwl6');
    });
  });

  describe('#round()', function() {
    it('should round to 0 precision by default', function() {
      expect(Math.round(13.456789)).to.be(13);
    });

    it('should round to given precision if given', function() {
      expect(Math.round(13.45678911111, 4)).to.be(13.4568);
    });
  });

  describe('Geometry', function() {
    describe('#circlesIntersect()', function() {
      context('when two circles with radii 5 are 9.9 horizontal units away from each other', function() {
        it('returns true', function() {
          expect(Math.Geometry.circlesIntersect(5, 5, 0, 0, 0, 9.9)).to.be(true);
        });
      });

      context('when two circles with radii 5 are 9.9 vertical units away from each other', function() {
        it('returns true', function() {
          expect(Math.Geometry.circlesIntersect(5, 5, 0, 9.9, 0, 0)).to.be(true);
        });
      });

      context('when two circles with radii 5 are 10 horizontal units away from each other', function() {
        it('returns false', function() {
          expect(Math.Geometry.circlesIntersect(5, 5, 0, 0, 0, 10)).to.be(false);
        });
      });

      context('when two circles with radii 5 are 10 vertical units away from each other', function() {
        it('returns false', function() {
          expect(Math.Geometry.circlesIntersect(5, 5, 0, 10, 0, 0)).to.be(false);
        });
      });
    });

    describe('#convertPlaneToRectangle()', function() {
      it('returns width / height for a THREE.PlaneGeometry', function() {
        const geo = new THREE.PlaneGeometry(13, 17);
        expect(Math.Geometry.convertPlaneToRectangle(geo)).to.eql({w: 13, h: 17});
      });
    });

    describe('#rectanglesIntersect()', function() {
      context('when a rectangle sized 10x10 is at 0, 0', function() {
        context('and another rectangle 10x10 is at 9, 9', function() {
          it('returns true', function() {
            expect(Math.Geometry.rectanglesIntersect(0, 0, 10, 10, 9, 9, 10, 10)).to.be(true);
          });
        });

        context('and another rectangle 10x10 is at 10, 0', function() {
          it('returns false', function() {
            expect(Math.Geometry.rectanglesIntersect(0, 0, 10, 10, 10, 0, 10, 10)).to.be(false);
          });
        });

        context('and another rectangle 10x10 is at -10, 0', function() {
          it('returns false', function() {
            expect(Math.Geometry.rectanglesIntersect(0, 0, 10, 10, -10, 10, 10, 10)).to.be(false);
          });
        });

        context('and another rectangle 10x10 is at 0, 10', function() {
          it('returns false', function() {
            expect(Math.Geometry.rectanglesIntersect(0, 0, 10, 10, 0, 10, 10, 10)).to.be(false);
          });
        });

        context('and another rectangle 10x10 is at 0, -10', function() {
          it('returns false', function() {
            expect(Math.Geometry.rectanglesIntersect(0, 0, 10, 10, 0, -10, 10, 10)).to.be(false);
          });
        });
      });
    });
  });
});
