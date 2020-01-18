const expect = require('expect.js');
const sinon = require('sinon');

const {Entity} = require('@snakesilk/engine');
const {Physics} = require('@snakesilk/platform-traits');

const Fallaway = require('../Fallaway');

describe('Fallaway Trait', function() {
  describe('on instantiation', function() {
    let fallaway;
    before(function() {
       fallaway = new Fallaway;
    });

    it('has name "fallaway"', function() {
      expect(fallaway.NAME).to.be('fallaway');
    });

    it('has delay set to 1', function() {
      expect(fallaway.delay).to.be(1);
    });

    it('has a countdown set to null', function() {
      expect(fallaway._countdown).to.be(null);
    });
  });

  describe('when applied incorrectly', function() {
    it('throws an expection if "Physics" trait not applied', function() {
      const host = new Entity();
      expect(function() {
        host.applyTrait(new Conveyor);
      }).to.throwError();
    });
  });

  describe('when applied successfully', function() {
    let host;
    before(function() {
      host = new Entity();
      host.applyTrait(new Physics);
      host.applyTrait(new Fallaway);
      host.position.set(13, 17, -7);
    });

    it('exposes itself on host', function() {
      expect(host.fallaway).to.be.a(Fallaway);
    });

    it('disables physics on host', function() {
      expect(host.physics._enabled).to.be(false);
    });

    describe('when colliding with a player', function() {
      let player;
      before(function() {
        player = new Entity();
        player.isPlayer = true;
        host.collides(player);
      });

      it('starts its countdown with delay length', function() {
        expect(host.fallaway._countdown).to.be(host.fallaway.delay);
      });

      describe('before countdown reaches 0', function() {
        before(function() {
          host.timeShift(.5);
        });

        it('physics is still disabled', function() {
          expect(host.physics._enabled).to.be(false);
        });
      });

      describe('when countdown reaches 0', function() {
        before(function() {
          host.timeShift(.6);
        });

        it('enables physics on host', function() {
          expect(host.physics._enabled).to.be(true);
        });

        it('saves origin position', function() {
          expect(host.position).to.eql(host.fallaway._origin);
        });

        it('stops countdown', function() {
          expect(host.fallaway._countdown).to.be(null);
        });
      });

      describe('when reset', function() {
        before(function() {
          host.fallaway.reset();
        });

        it('disables physics on host', function() {
          expect(host.physics._enabled).to.be(false);
        });

        it('puts host on origin', function() {
          expect(host.position).to.eql({x: 13, y: 17, z: -7});
        });

        it('forgets origin', function() {
          expect(host.fallaway._origin).to.be(null);
        });
      });
    });
  });

  describe('#reset()', function() {
    let host
    before(function() {
      host = new Entity();
      host.applyTrait(new Physics);
      host.applyTrait(new Fallaway);
      sinon.stub(host.physics, 'disable');
      sinon.stub(host.physics, 'zero');
      host.reset();
    });

    it('runs disable() on physics trait', function() {
      expect(host.physics.disable.callCount).to.be(1);
    });

    it('runs zero() on physics trait', function() {
      expect(host.physics.zero.callCount).to.be(1);
    });
  });
});
