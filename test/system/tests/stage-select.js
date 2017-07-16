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

    it('indicator is in center', () => {
      expect(scene.world.getObject('indicator').position).to.eql({
        x: 0,
        y: 8,
        z: 0.1
      });
    });

    describe('after 1 second', () => {
      beforeEach(() => env.waitTime(1));

      it('is zoomed out', () => {
        expect(camera.position.z).to.be(140);
      });
    });
  });

  describe('Indicator', () => {
    it('has blink trait', () => {
      const indicator = scene.world.getObject('indicator');
      expect(indicator.blink.interval).to.be(0.25);
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

      it(`selects ${boss.name} stage`, () => {
        expect(spy.callCount).to.be(1);
        const stage = spy.lastCall.args[0];
        expect(stage.scene).to.be(boss.name);
      });

      describe('immediately after', () => {
        beforeEach(() => env.waitTime(0.1));

        it('removes indicator', () => {
          expect(scene.world.getObject('indicator')).to.be(false);
        });
      });

      describe('after 2.5 seconds', () => {
        beforeEach(() => env.waitTime(2.5));

        it('camera has moved to reveal boss', () => {
          expect(env.game.scene.camera.position).to.eql({
            x: 0,
            y: 512,
            z: 140,
          });
        });

        it.skip('stars are behind podium');

        it(`${boss.name} has been spawned in scene`, () => {
          const Boss = env.loader.resourceManager.get('entity', boss.name);
          const instance = env.game.scene.world.getObjects(boss.name)[0];
          expect(instance).to.be.a(Boss);
          expect(instance.position.x).to.be(0);
          expect(instance.position.y).to.be.within(516, 518);
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
