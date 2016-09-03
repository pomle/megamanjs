'use strict';

describe('Bubbleman Character', function() {
  const UVCoords = Engine.UVCoords;
  let bubbleman, texSz;

  before(done => {
    Promise.all([
      env.loader.resourceLoader.loadXML('/test/integration/fixtures/jump.xml'),
      env.loader.resourceLoader.loadXML('/src/resource/characters/Bubbleman.xml'),
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
      bubbleman = new objects.Bubbleman.constructor();

      scene.world.addObject(bubbleman);
      env.scene(scene);
      scene.world.updateTime(.1);
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
      expect(bubbleman.anim).to.be('idle');
    });
  });

  describe('when jumping', function() {
    before(() => {
      bubbleman.position.x = 64;
      bubbleman.jump.engage();
    });

    describe('immediately after', () => {
      before(done => env.waitTime(1/60).then(done));

      it('uses jump animation', function() {
        expect(bubbleman.anim).to.be('jump');
      });
    });

    describe('0.5 seconds after', () => {
      before(done => env.waitTime(.5).then(done));

      it('reaches height 120', () => {
        expect(bubbleman.position.y).to.be.within(120, 130);
      });

      describe('and while shooting', () => {
        before(() => {
          bubbleman.weapon.fire();
        });

        it('uses jump + fire animation', function() {
          expect(bubbleman.anim).to.be('jump-fire');
        });
      });
    });
  });
});
