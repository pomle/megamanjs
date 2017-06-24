const expect = require('expect.js');
const sinon = require('sinon');

const Timeline = require('../../src/engine/Timeline');

describe('Timeline', function() {
  it('should hold frame forever if not duration given', function() {
    const anim = new Timeline();
    anim.addFrame('A', 2);
    anim.addFrame('B', 3);
    anim.addFrame('C');
    expect(isNaN(anim.totalDuration)).to.be(true);
    expect(anim.getValueAtTime(1)).to.equal('A');
    expect(anim.getValueAtTime(4)).to.equal('B');
    expect(anim.getValueAtTime(6)).to.equal('C');
    expect(anim.getValueAtTime(9)).to.equal('C');
    expect(anim.getValueAtTime(12515152)).to.equal('C');
  });

  describe('#getLoopTime', function() {
    it('should find correct place in time for any input number', function() {
      const anim = new Timeline();
      anim.addFrame({}, 1);
      anim.addFrame({}, 4);
      anim.addFrame({}, 2);
      expect(anim.frames.length).to.equal(3);
      expect(anim.totalDuration).to.equal(7);
      expect(anim.accumulatedTime).to.equal(0);

      const len = anim.totalDuration;
      expect(anim.getLoopTime(-3)).to.equal(4);
      expect(anim.getLoopTime(2)).to.equal(2);
      // Big numbers
      expect(anim.getLoopTime(2 + len * -4933)).to.equal(2);
      expect(anim.getLoopTime(2 + len * 6823)).to.equal(2);
      // Floats
      expect(anim.getLoopTime(-3.2)).to.equal(3.8);
      expect(anim.getLoopTime(6.3)).to.be.within(6.3, 6.300000001);
    });
  });

  describe('#getIndex', function() {
    it('should return the index at the current time', function() {
      const anim = new Timeline();
      anim.addFrame('A', 4);
      anim.addFrame('B', 2);
      anim.addFrame('C', 3);
      anim.accumulatedTime = 5;
      expect(anim.getIndex()).to.equal(1);
      anim.accumulatedTime = 2;
      expect(anim.getIndex()).to.equal(0);
      anim.accumulatedTime = 10;
      expect(anim.getIndex()).to.equal(0);
      anim.accumulatedTime = 16;
      expect(anim.getIndex()).to.equal(2);
    });
  });

  describe('#getValue', function() {
    it('should return the value at the current time', function() {
      const anim = new Timeline();
      anim.addFrame('A', 4);
      anim.addFrame('B', 2);
      anim.addFrame('C', 3);
      anim.accumulatedTime = 5;
      expect(anim.getValue()).to.equal('B');
      anim.accumulatedTime = 2;
      expect(anim.getValue()).to.equal('A');
      anim.accumulatedTime = 10;
      expect(anim.getValue()).to.equal('A');
      anim.accumulatedTime = 16;
      expect(anim.getValue()).to.equal('C');
    });
  });

  describe('#getValueAtIndex', function() {
    it('should return the value at a specific index', function() {
      const anim = new Timeline();
      anim.addFrame('A', 4);
      anim.addFrame('B', 2);
      anim.addFrame('C', 3);
      expect(anim.getValueAtIndex(0)).to.equal('A');
      expect(anim.getValueAtIndex(1)).to.equal('B');
      expect(anim.getValueAtIndex(2)).to.equal('C');
    });
  });

  describe('#get(Index|Value)AtTime', function() {
    it('should return the correct value or index given a time', function() {
      const anim = new Timeline();
      anim.addFrame('A', 4);
      anim.addFrame('B', 2);
      anim.addFrame('C', 3);
      expect(anim.getIndexAtTime(0)).to.equal(0);
      expect(anim.getValueAtTime(0)).to.equal('A');
      expect(anim.getIndexAtTime(3)).to.equal(0);
      expect(anim.getValueAtTime(3)).to.equal('A');
      expect(anim.getIndexAtTime(4)).to.equal(1);
      expect(anim.getValueAtTime(4)).to.equal('B');
      expect(anim.getIndexAtTime(8.999)).to.equal(2);
      expect(anim.getValueAtTime(8.999)).to.equal('C');
    });
  });

  describe('#reset', function() {
    it('should set accumulatedTime to zero', function() {
      const anim = new Timeline();
      anim.accumulatedTime = 12;
      anim.reset();
      expect(anim.accumulatedTime).to.equal(0);
    });
  });

   describe('#resolveTime', function() {
    it('should return index at resolved time', function() {
      const anim = new Timeline();
      anim.addFrame('A', 1);
      anim.addFrame('B', 4);
      anim.addFrame('C', 2);
      expect(anim.resolveTime(1234.5).index).to.be(1);
    });

    it('should return value at resolved time', function() {
      const anim = new Timeline();
      anim.addFrame('A', 1);
      anim.addFrame('B', 4);
      anim.addFrame('C', 2);
      expect(anim.resolveTime(1234.5).value).to.be('B');
    });

    it('should return resolved length', function() {
      const anim = new Timeline();
      anim.addFrame('A', 1);
      anim.addFrame('B', 4);
      anim.addFrame('C', 2);
      expect(anim.resolveTime(1234.5).resolvedLength).to.be(2.5);
    });

    it('should return passed length', function() {
      const anim = new Timeline();
      anim.addFrame('A', 1);
      anim.addFrame('B', 4);
      anim.addFrame('C', 2);
      expect(anim.resolveTime(1234.5).passedLength).to.be(1);
    });
  });
});
