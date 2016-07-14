'use strict';

const expect = require('expect.js');
const sinon = require('sinon');

const env = require('../../env');
const DeathSpawn = env.Game.traits.DeathSpawn;

describe('DeathSpawn Trait', function() {
  it('should have a pool array', function() {
    const ds = new DeathSpawn;
    expect(ds.pool).to.be.an('array');
  });

   it('should have a chance property', function() {
    const ds = new DeathSpawn;
    expect(ds.chance).to.be.within(0, 1);
  });

  describe('#getRandom()', function() {
    it('should return null if pool empty', function() {
        const ds = new DeathSpawn;
        ds.chance = 1;
        expect(ds.getRandom()).to.be(null);
    });

    it('should return instance of pool entry', function() {
        function Moot() {}
        const ds = new DeathSpawn;
        ds.chance = 1;
        ds.pool.push(Moot);
        expect(ds.getRandom()).to.be.a(Moot);
    });

    it('should return instance of pool entry based on chance property', function() {
        function Moot() {}
        const ds = new DeathSpawn;

        ds.pool.push(Moot);
        ds.chance = .5;

        let fixedRand;
        sinon.stub(Math, 'random', function() {
            return fixedRand;
        });

        fixedRand = .55;
        expect(ds.getRandom()).to.be(null);
        fixedRand = 1;
        expect(ds.getRandom()).to.be(null);

        fixedRand = .3;
        expect(ds.getRandom()).to.be.a(Moot);
        fixedRand = 0;
        expect(ds.getRandom()).to.be.a(Moot);

        expect(Math.random.callCount).to.be(6);

        Math.random.restore();
    });

    it('should return random instance from pool', function() {
        function Moot1() {}
        function Moot2() {}
        function Moot3() {}

        const ds = new DeathSpawn;

        ds.chance = 1;
        ds.pool.push(Moot1);
        ds.pool.push(Moot2);
        ds.pool.push(Moot3);

        let fixedRand;
        sinon.stub(Math, 'random', function() {
            return fixedRand;
        });

        fixedRand = 0;
        expect(ds.getRandom()).to.be.a(Moot1);

        fixedRand = .33;
        expect(ds.getRandom()).to.be.a(Moot1);

        fixedRand = .34;
        expect(ds.getRandom()).to.be.a(Moot2);

        fixedRand = .66;
        expect(ds.getRandom()).to.be.a(Moot2);

        fixedRand = .9999999999;
        expect(ds.getRandom()).to.be.a(Moot3);

        expect(Math.random.callCount).to.be(10);

        Math.random.restore();
    });
  });
});
