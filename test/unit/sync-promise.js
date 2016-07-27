'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../env');
const SyncPromise = env.Engine.SyncPromise;

describe('SyncPromise', function() {
  it('should call thenable callback when resolved', function(done) {
    let resolve;
    const promise = new SyncPromise(r => resolve = r);

    function complete() {
      resolve(5);
    }

    promise.then(value => {
      expect(value).to.be(5);
      done();
    });

    complete();
  });

  it('should be thenable after resolved', function() {
    let resolve;
    const promise = new SyncPromise(r => resolve = r);

    function complete() {
      resolve(5);
    }

    complete();

    promise.then(value => {
      expect(value).to.be(5);
    });
  });

  it('should resolve all callbacks in order', function(done) {
    let resolve;
    const promise = new SyncPromise(r => resolve = r);

    function complete() {
      resolve(5);
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

  it('should provide chainability with non-promises', function(done) {
    let resolve;
    const promise = new SyncPromise(r => resolve = r);

    function complete() {
      resolve(5);
    }

    let sum = 0;
    promise.then(value => {
      return value + 3;
    }).then(value => {
      expect(value).to.be(8);
      done();
    });

    complete();
  });

  it('should provide chainability with promises', function(done) {
    const resolve = [];
    const promise = [
      new SyncPromise(r => resolve.push(r)),
      new SyncPromise(r => resolve.push(r)),
    ];

    let sum = 0;
    promise[0].then(value => {
      sum += value;
      expect(sum).to.be(5);
      return promise[1];
    }).then(value => {
      sum += value;
      expect(sum).to.be(8);
      done();
    });

    resolve[0](5);
    resolve[1](3);
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
});
