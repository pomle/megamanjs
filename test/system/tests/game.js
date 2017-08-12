describe('Megaman 2', function() {
  describe.skip('when loading game XML', () => {
    let game, loader, entrypoint;
    before(done => {
      game = new Engine.Game;
      loader = new XMLLoader(game);
      loader.loadGame('/resource/Megaman2.xml').then(_entrypoint => {
        entrypoint = _entrypoint;
        done();
      });
    });

    it('entrypoint is Intro', () => {
      expect(entrypoint).to.be('Intro');
    });

    it('player has 28 health max', () => {
      expect(game.player.character.health.energy.max).to.be(28);
    });

    it('player has 0 health min', () => {
      expect(game.player.character.health.energy.min).to.be(0);
    });

    describe('Loader', () => {
      it('should load a scene by name', function(done) {
        const game = new Engine.Game;
        const loader = new XMLLoader(game);
        loader.loadGame('/dist/resource/Megaman2.xml')
          .then(() => {
            return loader.loadSceneByName('Intro');
          })
          .then(scene => {
            expect(scene.name).to.be('Intro');
            done();
          });
      });
    });
  });
});
