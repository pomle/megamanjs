const expect = require('expect.js');
const sinon = require('sinon');

const Easing = require('../../src/engine/Easing');

describe('Easing', function() {
  const autoBlacklist = new Set([
    'easeIn',
    'squareWave',
  ]);

  Object.keys(Easing)
  .filter(name => !autoBlacklist.has(name))
  .forEach(name => {
    describe(name, () => {
      it('returns 0 for input 0', () => {
        const func = Easing[name]();
        expect(func(0)).to.be(0);
      });

      it('returns 1 for input 1', () => {
        const func = Easing[name]();
        expect(func(1)).to.be(1);
      });
    });
  });

  describe('easeIn', () => {
    describe('when called with 2', () => {
      it('returns a function easing using given power', () => {
        const func = Easing.easeIn(2);
        expect(func(.5)).to.be(.25);
        expect(func(.75)).to.be(0.5625);
      });
    });

    describe('when called with 5', () => {
      it('returns a function easing using given power', () => {
        const func = Easing.easeIn(5);
        expect(func(.5)).to.be(0.03125);
        expect(func(.75)).to.be(0.2373046875);
      });
    });
  });

  describe('easeOutElastic', () => {
    const fixture = [
      0,
      0.6492267813603143,
      1.2516594229609883,
      1.353551648778949,
      1.1244710430646594,
      0.9113448111830265,
      0.8750000684249789,
      0.9558325264336169,
      1.031231120066667,
      1.044194149632276,
      1.015672171299964,
      0.988998210173452,
      0.984375076978045,
      0.9944390598585873,
      1.0038755331493554,
      1.0055241961285502,
      1.001973148461377,
      0.9986348139581068,
      0.998046927387645,
      0.9992998939153357,
      1,
    ];

    let func;
    before(() => {
      func = Easing.easeOutElastic();
    });

    fixture.forEach((output, index) => {
      const input = index / 20;
      it(`returns ${output} for ${input}`, () => {
        expect(func(input)).to.be(output);
      });
    });
  });

  describe('squareWave', () => {
    describe('when initialized with repeat 1', () => {
      let func;
      before(() => {
        func = Easing.squareWave(1);
      });

      [
        [0, 1],
        [0.1, 1],
        [0.499999999999999, 1],
        [0.5, 1],
        [0.500000000000001, 0],
        [.6, 0],
        [.63, 0],
        [.9, 0],
        [.9999999999999999,  0],
        [1, 0],
      ].forEach(([input, output]) => {
        it(`returns ${output} for ${input}`, () => {
          expect(func(input)).to.be(output);
        });
      });
    });

    describe('when initialized with repeat 10', () => {
      let func;
      before(() => {
        func = Easing.squareWave(10);
      });

      [
        [0, 1],
        [0.05, 1],
        [0.0500000000001, 0],
        [0.0999999999999, 0],
        [0.11, 1],
        [0.21, 1],
        [.9, 0],
        [.9999999999999999,  0],
        [1, 0],
      ].forEach(([input, output]) => {
        it(`returns ${output} for ${input}`, () => {
          expect(func(input)).to.be(output);
        });
      });
    });
  });
});
