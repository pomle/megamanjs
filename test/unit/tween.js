const expect = require('expect.js');
const sinon = require('sinon');

const Tween = require('../../src/engine/Tween');

describe('Tween', function() {
  it('should ignore keys in to that are undefined', function() {
    const subject = {
        a: 1,
        b: 13,
        c: 15,
        d: 19,
    };
    const to = {
        a: undefined,
        b: -13,
        c: null,
        d: 0,
    };
    const tween = new Tween(to);
    tween.addSubject(subject);
    tween.update(1);
    expect(subject).to.eql({a: 1, b: -13, c: 15, d: 0});
  });
  it('should default to linear easing', function() {
    const subject = {
        a: 1,
        b: 13,
        c: 256,
    };
    const to = {
        a: 2,
        b: -13,
        c: 512,
    };
    const tween = new Tween(to);
    tween.addSubject(subject);
    tween.update(0.1);
    expect(subject).to.eql({a: 1.1, b: 10.4, c: 281.6});
    tween.update(0.5);
    expect(subject).to.eql({a: 1.5, b: 0, c: 384});
    tween.update(0.9);
    expect(subject).to.eql({a: 1.9, b: -10.400000000000002, c: 486.4});
  });
  it('should honor supplied easing function', function() {
    const subject = {
        x: 1,
    };
    const to = {
        x: 2,
    };
    const tween = new Tween(to, t => t > .5 ? 1 : 0);
    tween.addSubject(subject);
    tween.update(0.1);
    expect(subject).to.eql({x: 1});
    tween.update(0.5);
    expect(subject).to.eql({x: 1});
    tween.update(0.51);
    expect(subject).to.eql({x: 2});
  });
  it('should operate on multiple subjects', function() {
    const subjects = [
        { x: 1 },
        { x: 2 },
    ];
    const to = { x: 3 };
    const tween = new Tween(to);
    tween.addSubject(subjects[0]);
    tween.addSubject(subjects[1]);
    tween.update(0.5);
    expect(subjects[0]).to.eql({x: 2});
    expect(subjects[1]).to.eql({x: 2.5});
  });
  it('should be redirectable', function() {
    const subject = { x: 0, y: 0 };
    const tween = new Tween({x: 3});
    tween.addSubject(subject);
    tween.update(1);
    expect(subject).to.eql({x: 3, y: 0});
    tween.next({x: -5, y: 8});
    tween.update(1);
    expect(subject).to.eql({x: -5, y: 8});
  });
});
