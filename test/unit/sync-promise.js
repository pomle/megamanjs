'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../env');
const SyncPromise = env.Engine.SyncPromise;

describe('SyncPromise', function() {
  it('should call thenable callback when resolved', function(done) {
    const promise = new SyncPromise();

    function complete() {
      promise.resolve(5);
    }

    promise.then(value => {
      expect(value).to.be(5);
      done();
    });

    complete();
  });

  it('should be thenable after resolved', function() {
    const promise = new SyncPromise();

    function complete() {
      promise.resolve(5);
    }

    complete();

    promise.then(value => {
      expect(value).to.be(5);
    });
  });

  it('should resolve all callbacks in order', function(done) {
    const promise = new SyncPromise();

    function complete() {
      promise.resolve(5);
    }

    let sum = 0;
    promise.then(value => {
      sum += value;
    });
    promise.then(value => {
      sum += value;
    });
    promise.then(value => {
      sum += value;
    });
    promise.then(value => {
      sum += value;
      expect(sum).to.be(20);
      done();
    });

    complete();
  });

  describe('#resolve()', function() {
    it('should return a resolved promise', function(done) {
      const promise = SyncPromise.resolve(13.5);
      promise.then(value => {
        expect(value).to.be(13.5);
        done();
      });
    });
  });

  it.skip('should provide chainability', function(done) {
    const promise = new SyncPromise();

    function complete() {
      promise.resolve(5);
    }

    let sum = 0;
    promise.then(value => {
      return value + 3;
    }).then(value => {
      expect(value).to.be(8);
    });

    complete();
  });
});
