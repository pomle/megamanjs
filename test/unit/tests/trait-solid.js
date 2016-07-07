'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env.js');

const Obj = env.Engine.Object;
const World = env.Engine.World;
const Character = env.Game.objects.Character;
const Physics = env.Game.traits.Physics;
const Solid = env.Game.traits.Solid;

describe('Solid Trait', function() {
  const step = 1/120;

  context('when instantiating', function() {
    it('should have name set to "solid"', function() {
      const trait = new Game.traits.Solid();
      expect(trait.NAME).to.be('solid');
    });

    it('should have fixed and obstructs set to false', function() {
      const trait = new Game.traits.Solid();
      expect(trait.fixed).to.be(false);
      expect(trait.obstructs).to.be(false);
    });
  });
});
