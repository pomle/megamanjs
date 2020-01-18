const expect = require('expect.js');
const sinon = require('sinon');
const packageJSON = require('../../package.json');
const Main = require('../index.js');

describe('Main Export', function() {
  it('is defined in package.json', () => {
    expect(packageJSON.main).to.be('./dist/index.js');
  });

  describe('Exports', () => {
    it('exports Entities', () => {
      expect(Main.Entities).to.be(require('../entities'));
    });

    describe('Entities', () => {
      [
        // Characters
        ['Airman', './character/Airman'],
        ['Crashman', './character/Crashman'],
        ['Flashman', './character/Flashman'],
        ['Heatman', './character/Heatman'],
        ['Megaman', './character/Megaman'],
        ['Metalman', './character/Metalman'],

        // Enemies
        ['ChangkeyMaker', './character/ChangkeyMaker'],
        ['Shotman', './character/Shotman'],
        ['SniperArmor', './character/SniperArmor'],
        ['SniperJoe', './character/SniperJoe'],
        ['Telly', './character/Telly'],

        // Weapons
        ['AirShooter', './weapon/AirShooter'],
        ['CrashBomber', './weapon/CrashBomber'],
        ['EnemyPlasma', './weapon/EnemyPlasma'],
        ['MetalBlade', './weapon/MetalBlade'],
        ['Plasma', './weapon/Plasma'],
        ['TimeStopper', './weapon/TimeStopper'],
      ].forEach(([name, file]) => {
        it(`contains ${name}`, () => {
          expect(Main.Entities[name]).to.be(require('../entities/' + file));
        });
      });
    });

    it('exports traits registry', () => {
      expect(Main.Traits).to.be(require('../traits'));
    });
  });
});
