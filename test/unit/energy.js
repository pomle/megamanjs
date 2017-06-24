const expect = require('expect.js');
const sinon = require('sinon');

const Energy = require('../../src/engine/logic/Energy');

describe('Energy', function() {
  describe('when instantiating with no args', () => {
    let energy;
    beforeEach(() => {
      energy = new Energy();
    });

    it('defaults to 100 max', () => {
      expect(energy.max).to.be(100);
    });

    it('defaults to 0 min', () => {
      expect(energy.min).to.be(0);
    });

    it('infinite is false', () => {
      expect(energy.infinite).to.be(false);
    });
  });

  describe('when instantiating with only max', () => {
    let energy;
    beforeEach(() => {
      energy = new Energy(37);
    });

    it('honors max', () => {
      expect(energy.max).to.be(37);
    });

    it('defaults to 0 min', () => {
      expect(energy.min).to.be(0);
    });
  });

  describe('when instantiating with max and min', () => {
    let energy;
    beforeEach(() => {
      energy = new Energy(27, 13);
    });

    it('honors given max value', () => {
      expect(energy.max).to.be(27);
    });

    it('honors given max min', () => {
      expect(energy.max).to.be(27);
    });
  });

  describe('when set up with max 100 and min 0', () => {
    let energy;
    let spy;
    beforeEach(() => {
      energy = new Energy(100, 0);
      spy = sinon.spy();
      energy.events.bind(energy.EVENT_CHANGE, spy);
    });

    describe('and amount set to 100', () => {
      beforeEach(() => {
        energy.amount = 100;
      });

      it('does not emit change event', () => {
        expect(spy.callCount).to.be(0);
      });

      describe('.fraction', () => {
        it('is 1', () => {
          expect(energy.fraction).to.be(1);
        });
      });

      describe('.full', () => {
        it('is true', () => {
          expect(energy.full).to.be(true);
        });
      });

      describe('.depleted', () => {
        it('is false', () => {
          expect(energy.depleted).to.be(false);
        });
      });

      describe('.deplete()', () => {
        beforeEach(() => {
          energy.deplete();
        });

        it('reduces amount to min', () => {
          expect(energy.amount).to.be(energy.min);
        });

        it('it emits change event', () => {
          expect(spy.callCount).to.be(1);
        });
      });
    });

    describe('and infinite set to true', () => {
      beforeEach(() => {
        energy.infinite = true;
      });

      it('amount is immutable', () => {
        energy.amount = 0;
        expect(energy.amount).to.be(100);
      });

      it('it does not emit change event', () => {
        energy.amount = 0;
        expect(spy.callCount).to.be(0);
      });
    });

    describe('and amount set to 0', () => {
      beforeEach(() => {
        energy.amount = 0;
      });

      it('it emits change event', () => {
        expect(spy.callCount).to.be(1);
      });

      describe('.fraction', () => {
        it('is 0', () => {
          expect(energy.fraction).to.be(0);
        });
      });

      describe('.full', () => {
        it('is false', () => {
          expect(energy.full).to.be(false);
        });
      });

      describe('.depleted', () => {
        it('is true', () => {
          expect(energy.depleted).to.be(true);
        });
      });

      describe('.fill()', () => {
        beforeEach(() => {
          energy.fill();
        });

        it('fills amount to max', () => {
          expect(energy.amount).to.be(energy.max);
        });

        it('it emits change event', () => {
          expect(spy.callCount).to.be(2);
        });
      });
    });

    describe('and amount set to 50', () => {
      beforeEach(() => {
        energy.amount = 50;
      });

      it('change event is emitted', () => {
        expect(spy.callCount).to.be(1);
      });

      describe('and then max set to 40', () => {
        beforeEach(() => {
          energy.max = 40;
        });

        it('amount is decreased to match max', () => {
          expect(energy.amount).to.be(40);
        });

        it('change event is emitted again', () => {
          expect(spy.callCount).to.be(2);
        });
      });

      describe('and then min set to 60', () => {
        beforeEach(() => {
          energy.min = 60;
        });

        it('amount is increased to match min', () => {
          expect(energy.amount).to.be(60);
        });

        it('change event is emitted again', () => {
          expect(spy.callCount).to.be(2);
        });
      });
    });

    describe('and amount set to 99', () => {
      beforeEach(() => {
        energy.amount = 99;
      });

      describe('.fraction', () => {
        it('is .99', () => {
          expect(energy.fraction).to.be(.99);
        });
      });

      describe('.full', () => {
        it('is false', () => {
          expect(energy.full).to.be(false);
        });
      });

      describe('.depleted', () => {
        it('is false', () => {
          expect(energy.depleted).to.be(false);
        });
      });
    });

    describe('and amount set to 120', () => {
      beforeEach(() => {
        energy.amount = 120;
      });

      it('amount does not surpass max 100', () => {
        expect(energy.amount).to.be(100);
      });

      it('change event is not emitted', () => {
        expect(spy.callCount).to.be(0);
      });
    });

    describe('and amount set to -10', () => {
      beforeEach(() => {
        energy.amount = -10;
      });

      it('amount does not go below min 0', () => {
        expect(energy.amount).to.be(0);
      });
    });

    describe('and infinite set to true', () => {
      beforeEach(() => {
        energy.infinite = true;
      });

      describe('.fraction', () => {
        it('is 1', () => {
          expect(energy.fraction).to.be(1);
        });
      });
    });

    describe('and trying to set min to a non-number', () => {
      it('throws an expection', () => {
        expect(() => {
          energy.min = 'a';
        }).to.throwError();
      });
    });

    describe('and trying to set max to a non-number', () => {
      it('throws an expection', () => {
        expect(() => {
          energy.max = 'a';
        }).to.throwError();
      });
    });

    describe('and trying to set amount to a non-number', () => {
      it('throws an expection', () => {
        expect(() => {
          energy.amount = 'a';
        }).to.throwError();
      });
    });
  });

  describe('when set up with max 50 and min 50', () => {
    let energy;
    beforeEach(() => {
      energy = new Energy(50, 50);
    });

    describe('.fraction', () => {
      it('is 1', () => {
        expect(energy.fraction).to.be(1);
      });
    });
  });

  describe('when set up with max 20, min -70, and amount 30', () => {
    let energy;
    beforeEach(() => {
      energy = new Energy(30, -70);
      energy.amount = 10;
    });

    it('.fraction is 0.8', () => {
      expect(energy.fraction).to.be(0.8);
    });
  });
});
