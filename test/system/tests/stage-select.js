'use strict';

describe('Stage Select', function() {
  let camera, scene;

  beforeEach(done => {
    env.load('StageSelect').then(_scene => {
      scene = _scene;
      env.scene(_scene);
      camera = env.game.scene.camera;
      done();
    });
  });

  afterEach(() => {
    env.game.unsetScene();
  });

  describe('At start', () => {
    it('is zoomed in', () => {
      expect(camera.position.z).to.be(40);
    });

    it.skip('has center selected', () => {
      expect(scene.currentIndex).to.be(4);
      expect(scene.indicator.position).to.eql({x: 64, y: -64, z: 0.1});
    });

    describe('after 1 second', () => {
      beforeEach(done => env.waitTime(1).then(done));

      it('is zoomed out', () => {
        expect(camera.position.z).to.be(140);
      });
    });
  });

  describe.skip('Indicator', () => {
    describe('when idling', () => {
      it('blinks', done => {
        expect(scene.indicator.visible).to.be(true);
        let seconds = 2;
        let interval = 0.125;
        let chain = env.waitTime(interval);
        let state = false;
        while (seconds > 0) {
          seconds -= interval;
          chain = chain.then(() => {
            expect(scene.indicator.visible).to.be(state);
            state = !state;
            return env.waitTime(interval);
          });
        }
        chain.then(done);
      });
    });
  });

  const bosses = [
    {
      keys: 'up',
      name: 'Airman',
    },
    {
      keys: 'down',
      name: 'Flashman',
    },
    {
      keys: 'left',
      name: 'Heatman',
    },
    {
      keys: 'down left',
      name: 'Metalman',
    },
  ];

  bosses.forEach(boss => {
    describe(`when pressing ${boss.keys} and start`, () => {
      let spy = sinon.spy();
      beforeEach(() => {
        const scene = env.game.scene;
        scene.events.once('stage-selected', spy);
        env.tap(boss.keys);
        env.tap('start');
      });

      it(`should select ${boss.name} stage`, () => {
        expect(spy.callCount).to.be(1);
        const stage = spy.lastCall.args[0];
        expect(stage.name).to.be(boss.name);
      });

      describe('after 2.5 seconds', () => {
        beforeEach(done => env.waitTime(2.5).then(done));

        it('camera has moved to reveal boss', () => {
          expect(env.game.scene.camera.position.y).to.be(440);
        });

        it(`${boss.name} has been spawned in scene`, () => {
          const Char = env.loader.resourceManager.get('entity', boss.name);
          const model = env.game.scene.world.getObjects(boss.name)[0];
          expect(model).to.be.a(Char);
          expect(model.position.x).to.be(64);
          expect(model.position.y).to.be.within(434, 444);
        });

        describe('after 5 seconds', () => {
          let spy;

          beforeEach(done => {
            spy = sinon.spy();
            env.game.events.once(env.game.EVENT_SCENE_SET, spy);
            env.waitUntil(() => spy.called).then(done);
          });

          it(`has loaded ${boss.name} level`, () => {
            expect(spy.callCount).to.be(1);
            expect(spy.lastCall.args[0].name).to.be(boss.name);
          });
        });
      });
    });
  });
});
