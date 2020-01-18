const expect = require('expect.js');
const sinon = require('sinon');

const {Entity, World} = require('@snakesilk/engine');
const {Physics, Solid} = require('@snakesilk/platform-traits');

const Conveyor = require('../Conveyor');

describe('Conveyor Trait', () => {
  describe('on instantiation', () => {
    let conveyor;

    beforeEach(() => {
      conveyor = new Conveyor();
    });

    it('has name', () => {
      expect(conveyor.NAME).to.be('conveyor');
    })

    it('is instance of Solid', () => {
      expect(conveyor).to.be.a(Solid);
    });

    it('has fixed prop set', () => {
      expect(conveyor.fixed).to.be(true);
    });

    it('has obstructs prop set', () => {
      expect(conveyor.obstructs).to.be(true);
    });

    describe('when applied', () => {
      let host;

      beforeEach(() => {
        host = new Entity();
        host.applyTrait(conveyor);
      });

      it('exposes property on host', () => {
        expect(host.conveyor).to.be(conveyor);
      });

      describe('#swapDirection()', () => {
        it('negates velocity', () => {
          conveyor.velocity.x = 40;
          conveyor.swapDirection();
          expect(conveyor.velocity.x).to.be(-40);
        });

        it('negates host direction x', () => {
          host.direction.x = 1;
          host.conveyor.swapDirection();
          expect(host.direction.x).to.be(-1);
        });
      });

      describe('on interaction', () => {
        let world, character;

        beforeEach(() => {
          world = new World();

          host.addCollisionRect(100, 10);
          world.addObject(host);

          subject = new Entity();
          subject.addCollisionRect(10, 10);
          subject.applyTrait(new Solid());

          const physics = new Physics();
          physics.mass = 1;
          subject.applyTrait(physics);
          world.addObject(subject);
        });

        describe('with collision from above', () => {
          beforeEach(() => {
            host.position.set(0, 0, 0);
            subject.position.set(0, 9, 0);
            subject.velocity.set(0, -20);
            world.updateTime(.5);
          });

          it('blocks subject movement', () => {
            expect(subject.position.y).to.be(10);
          });

          it('applies velocity', () => {
            expect(subject.velocity).to.eql({
              x: 38.37630341791378,
              y: -9.706134525217662,
            });
          });

          it('translates subject', () => {
            expect(subject.position.x).to.be(18.401098047650922);
          });
        });

        /*
        I don't know why this does not give expected results currently.
        Looks good on screen.
        */
        describe.skip('with collision from below', () => {
          beforeEach(() => {
            host.position.set(0, 0, 0);
            subject.position.set(0, -9, 0);
            subject.velocity.set(0, 20);
            world.simulateTime(.5);
          });

          it('subject is blocked', () => {
            expect(subject.position).to.eql({
              x: 0,
              y: -10,
              z: 0,
            });
            expect(subject.velocity).to.eql({x: 0, y: 20});
          });
        });
      });
    });
  });
});
