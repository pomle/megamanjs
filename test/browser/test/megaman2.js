'use strict';

describe('Megaman 2', function() {
  const game = new Game;
  const loader = new Game.Loader.XML(game);

  let _time = 0;
  function time(add) {
    game.scene.timer.eventLoop(_time);
    game.scene.timer.eventLoop(_time += add * 1000);
  }

  function touch(keys) {
    keys.split(' ').forEach(key => {
        game.input.trigger(key, game.input.ENGAGE);
        game.input.trigger(key, game.input.RELEASE);
    });
  }

  it('should load game', function(done) {
    const screen = document.querySelector('#screen');
    game.attachToElement(screen);
    game.setResolution(640, 480);
    game.adjustResolution();

    loader.loadGame('../../../src/resource/Megaman2.xml').then(entrypoint => {
        return loader.loadSceneByName(entrypoint);
    }).then(scene => {
        game.setScene(scene);
        game.render();
        done();
    });
  });

  it('should go to scene select when pressing start', function(done) {
    this.timeout(10000);
    game.events.once(game.EVENT_SCENE_CREATE, scene => {
      game.render();
      done();
    });
    time(1);
    game.render();
    time(1);
    game.render();
    time(14);
    game.render();
    //touch('start');
  });

  it.skip('should select Heatman stage when pressing left and start', function(done) {
    this.timeout(10000);
    game.events.once(game.EVENT_SCENE_CREATE, scene => {
      game.render();
      done();
    });
    touch('left start');
  });
});
