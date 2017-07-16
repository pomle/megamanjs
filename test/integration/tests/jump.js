describe('Jump', () => {
  let player;

  before(done => {
    env.ready.then(() => {
      return env.load('/test/integration/fixtures/jump.xml');
    }).then(scene => {
      env.scene(scene);
      player = env.game.player.character;
      done();
    }).catch(done);
  });

  after(() => {
    env.game.unsetScene();
  });

  beforeEach(() => {
    env.release();
    player.reset();
  });

  describe('when jumping without obstruction', () => {
    let maxHeight = -Infinity;
    before(done => {
      player.position.x = -56;
      player.position.y = 0;
      env.settle();
      player.jump.engage();
      env.waitUntil(data => {
        if (player.position.y < maxHeight) {
          return true;
        }
        maxHeight = player.position.y;
      }).then(done);
    });

    it('max height should be between 64 and 65', () => {
      expect(maxHeight).to.be.within(64, 65);
    });
  });

  describe('when jumping into obstruction', () => {
    let maxHeight = -Infinity;
    before(done => {
      player.position.x = 0;
      player.position.y = 0;
      env.settle();
      player.jump.engage();
      env.waitUntil(data => {
        if (player.position.y < maxHeight) {
          return true;
        }
        maxHeight = player.position.y;
      }).then(done);
    });

    it('jump should be cancelled', () => {
      expect(maxHeight).to.be.within(30, 30.2);
    });
  });
});
