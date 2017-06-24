const expect = require('expect.js');
const sinon = require('sinon');

const Mouse = require('../../src/engine/Mouse');

describe('Mouse', function() {
  describe('#sluggish()', function() {
    let timeMs;
    beforeEach(function() {
      timeMs = 1000000;
      sinon.stub(Date, 'now', function() {
        return timeMs;
      });
    });

    afterEach(function() {
      Date.now.restore();
    });

    it('should call callback if enough events fired in interval', function() {
      const callbackSpy = sinon.spy();
      const wrapper = Mouse.sluggish(callbackSpy, 2);
      wrapper();
      wrapper();
      expect(callbackSpy.callCount).to.be(0);
      wrapper();
      expect(callbackSpy.callCount).to.be(1);
    });

    it('should call callback immediately if sluggishness is 0', function() {
      const callbackSpy = sinon.spy();
      const wrapper = Mouse.sluggish(callbackSpy, 0);
      wrapper();
      expect(callbackSpy.callCount).to.be(1);
    });

    it('should reset callback if enough time leapt past', function() {
      const callbackSpy = sinon.spy();
      const wrapper = Mouse.sluggish(callbackSpy, 2);
      wrapper();
      wrapper();
      expect(callbackSpy.callCount).to.be(0);
      timeMs += 5000;
      wrapper();
      expect(callbackSpy.callCount).to.be(0);
    });
  });
});
