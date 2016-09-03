'use strict';

describe('Metalman Character', function() {
  const UVCoords = Engine.UVCoords;
  let metalman, startY;

  before(done => {
    Promise.all([
      env.loader.resourceLoader.loadXML('/test/integration/fixtures/jump.xml'),
      env.loader.resourceLoader.loadXML('/src/resource/characters/Metalman.xml'),
      env.ready,
    ]).then(([sceneXML, charXML]) => {
      const sceneParser = new Game.Loader.XML.SceneParser(env.loader, sceneXML.children[0]);
      const objectParser = new Game.Loader.XML.ObjectParser(env.loader, charXML.children[0]);

      return Promise.all([
        sceneParser.getScene(),
        objectParser.getObjects(),
      ]);
    }).then(([scene, objects]) => {
      scene.camera.position.y = 100;
      scene.camera.position.z = 200;
      metalman = new objects.Metalman.constructor();

      scene.world.addObject(metalman);
      scene.world.simulateTime(0);
      scene.world.updateAnimation(0);
      env.scene(scene);
      done();
    }).catch(done);
  });

  after(() => {
    env.game.unsetScene();
  });

  beforeEach(() => {

  });

  afterEach(() => {
    env.game.render();
  });

  describe('when idle', function() {
    it('uses idle animation', function() {
      expect(metalman.anim).to.be('idle');
    });
  });

  describe('when jumping', function() {
    let startY;
    before(() => {
      startY = metalman.position.y;
      metalman.position.x = 64;
      metalman.jump.engage();
    });

    describe('immediately after', () => {
      before(done => env.waitTime(1/60).then(done));

      it('uses jump animation', function() {
        expect(metalman.anim).to.be('jump');
      });
    });

    describe('when reached maximum height', () => {
      let maxY;
      before(done => {
        maxY = metalman.position.y;
        env.waitUntil(data => {
          if (maxY > metalman.position.y) {
            return true;
          } else {
            maxY = metalman.position.y;
            return false;
          }
        }).then(done);
      });

      it('reaches height ~140', () => {
        expect(maxY - startY).to.be.within(138, 142);
      });

      describe('and shooting', () => {
        before(() => {
          metalman.weapon.fire();
        });

        it('uses jump + fire animation', function() {
          expect(metalman.anim).to.be('jump-fire');
        });
      });
    });
  });
});
