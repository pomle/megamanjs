'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env');
const RequestAnimationFrameMock = require('../../mocks/requestanimationframe-mock');
const Object = env.Engine.Object;
const Level = env.Game.scenes.Level;

describe('Level', function() {
  function createLevel() {
    RequestAnimationFrameMock.mock();
    const level = new Level;
    RequestAnimationFrameMock.clean();
    return level;
  }

  describe('#resetObjects', function() {
    it('should run reset function on every trait of every object if available', function() {
      const level = createLevel();
      const thing = new Engine.Object();
      const resetSpy = sinon.spy();
      thing.traits = [
        { reset: resetSpy },
        { dummy: null },
      ];
      level.world.addObject(thing);
      level.resetObjects();
      expect(resetSpy.callCount).to.be(1);
    });
  });
});
