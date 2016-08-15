'use strict';

describe('Megaman 2', function() {
  it('should load game with entrypoint Intro', function(done) {
    const game = new Game;
    const loader = new Game.Loader.XML(game);
    loader.loadGame('/resource/Megaman2.xml').then(entrypoint => {
      expect(entrypoint).to.be('Intro');
      done();
    });
  });

  it('should load a scene by name', function(done) {
    const game = new Game;
    const loader = new Game.Loader.XML(game);
    loader.loadGame('/resource/Megaman2.xml')
      .then(() => {
        return loader.loadSceneByName('Intro');
      })
      .then(scene => {
        expect(scene.name).to.be('Intro');
        done();
      });
  });
});
