'use strict';

describe('Megaman Colors', () => {
  let player, weapons;

  before(done => {
    env.ready.then(() => {
      player = env.game.player.character;
      weapons = env.game.player.weapons;

      const scene = new Engine.Scene();
      scene.camera.position.z = 100;
      scene.world.gravityForce.set(0, 0);
      scene.world.addObject(player);
      scene.world.updateTime(0.1);
      env.scene(scene);

      done();
    }).catch(done);
  });

  after(() => {
    player.weapon.equip(weapons.p);
    env.game.unsetScene();
  });

  function getPixel(x, y) {
    const scale = env.loader.textureScale;
    return player.model.material.map.image
      .getContext('2d')
      .getImageData(x * scale, y * scale, 1, 1);
  }

  describe('when changing weapon', () => {
    describe('to Plasma (default)', () => {
      before(() => {
        player.weapon.equip(weapons.p);
        env.game.render();
      });

      it('palette is blue shaded', () => {
        expect(getPixel(26, 26).data).to.eql([0, 255, 255, 255]);
        expect(getPixel(26, 29).data).to.eql([0, 115, 247, 255]);
      });
    });

    describe('to Air Shooter', () => {
      before(() => {
        player.weapon.equip(weapons.a);
        env.game.render();
      });

      it('palette is white and blue', () => {
        expect(getPixel(26, 26).data).to.eql([248, 248, 248, 255]);
        expect(getPixel(26, 29).data).to.eql([0, 120, 248, 255]);
      });
    });

    describe('to Crash Bomber', () => {
      before(() => {
        player.weapon.equip(weapons.c);
        env.game.render();
      });

      it('palette is white and red', () => {
        expect(getPixel(26, 26).data).to.eql([248, 248, 248, 255]);
        expect(getPixel(26, 29).data).to.eql([248, 120, 88, 255]);
      });
    });

    describe('to Metal Blade', () => {
      before(() => {
        player.weapon.equip(weapons.m);
        env.game.render();
      });

      it('palette is green shaded', () => {
        expect(getPixel(26, 26).data).to.eql([255, 224, 168, 255]);
        expect(getPixel(26, 29).data).to.eql([172, 175, 0, 255]);
      });
    });

    describe('to Time Stopper', () => {
      before(() => {
        player.weapon.equip(weapons.f);
        env.game.render();
      });

      it('palette is purple shaded', () => {
        expect(getPixel(26, 26).data).to.eql([248, 184, 248, 255]);
        expect(getPixel(26, 29).data).to.eql([216, 0, 204, 255]);
      });
    });
  });
});
