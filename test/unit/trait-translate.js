const expect = require('expect.js');
const sinon = require('sinon');

const Object = require('../../src/engine/Object');
const Translate = require('../../src/engine/traits/Translate');

describe('Translate Trait', function() {
  function createTranslate()
  {
    const obj = new Object;
    obj.applyTrait(new Translate);
    return obj;
  }

  it('should have a velocity', function() {
    const translate = new Translate;
    expect(translate.velocity.x).to.be.a('number');
    expect(translate.velocity.y).to.be.a('number');
  });

  it('should expose translate property on host', function() {
    const host = createTranslate();
    expect(host.translate).to.be.a(Translate);
  });

  it('should move host when time updated', function() {
      const obj = createTranslate();
      obj.translate.velocity.set(5, 5);
      obj.timeShift(.5);
      expect(obj.position).to.eql({x: 2.5, y: 2.5, z: 0});
  });

  it('should honor velocity', function() {
      const obj = createTranslate();
      obj.translate.velocity.set(10, 5);
      obj.timeShift(1);
      expect(obj.position).to.eql({x: 10, y: 5, z: 0});
      obj.translate.velocity.set(-10, 5);
      obj.timeShift(2);
      expect(obj.position).to.eql({x: -10, y: 15, z: 0});
  });
});
