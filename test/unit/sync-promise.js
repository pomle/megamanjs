'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../env');
const SyncPromise = env.Engine.SyncPromise;

describe('SyncPromise', function() {
  it('should call thenable callback when resolved', function() {
    let resolve;
    const promise = new SyncPromise(r => resolve = r);

    let sum = 3;
    promise.then(value => {
      expect(value).to.be(5);
      sum += value;
    });

    resolve(5);
    expect(sum).to.be(8);
  });

  it('should be thenable after resolved', function() {
    let resolve;
    const promise = new SyncPromise(r => resolve = r);

    resolve(5);

    let sum = 0;
    promise.then(value => {
      expect(value).to.be(5);
      sum += value;
    });
    promise.then(value => {
      expect(value).to.be(5);
      sum += value;
    });

    expect(sum).to.be(10);
  });

  it('should resolve all callbacks in order', function() {
    let resolve;
    const promise = new SyncPromise(r => resolve = r);

    let sum = 0;
    promise.then(value => {
      sum += value;
      expect(sum).to.be(5);
    });
    promise.then(value => {
      sum += value;
      expect(sum).to.be(10);
    });
    promise.then(value => {
      sum += value;
      expect(sum).to.be(15);
    });
    promise.then(value => {
      sum += value;
      expect(sum).to.be(20);
    });

    resolve(5);
    expect(sum).to.be(20);
  });

  it('should provide chainability with non-promises', function() {
    let resolve;
    const promise = new SyncPromise(r => resolve = r);

    let sum = 0;
    promise.then(value => {
      sum += value;
      return value + 3;
    }).then(value => {
      sum += value;
      expect(value).to.be(8);
    });

    resolve(5);
    expect(sum).to.be(13);
  });

  it('should provide chainability with promises', function() {
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
    });

    resolve[0](5);
    resolve[1](3);
    expect(sum).to.be(8);
  });

  it('should hook into call stack when promise resolves', function() {
    let resolve;
    const promise = new SyncPromise(r => resolve = r);

    let sum = 0;
    promise.then(value => {
      sum += value;
      expect(sum).to.be(5);
    });

    resolve(5);
    sum += 3;
    expect(sum).to.be(8);
  });

  it('should execute in synchronous order', function() {
    let resolve;
    const promise = new SyncPromise(r => resolve = r);

    let sum = 0;
    promise.then(() => {
      expect(++sum).to.be(2);
    }).then(() => {
      expect(++sum).to.be(3);
    });

    expect(++sum).to.be(1);
    resolve();
    expect(++sum).to.be(4);
  });

  describe('#resolve()', function() {
    it('should return a resolved promise', function() {
      const promise = SyncPromise.resolve(13.5);
      let sum = 0;
      promise.then(value => {
        sum += value;
        expect(value).to.be(13.5);
      });
      expect(sum).to.be(13.5);
    });
  });
});
