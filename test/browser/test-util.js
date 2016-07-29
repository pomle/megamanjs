class TestEnv
{
  constructor()
  {
    const game = new Game;
    const loader = new Game.Loader.XML(game);

    let currentTime = 0;
    this.time = function time(add) {
      game.scene.timer.eventLoop(currentTime);
      game.scene.timer.eventLoop(currentTime += add * 1000);
    }

    this.tap = function tap(keys) {
      keys.split(' ').forEach(key => {
          game.input.enable();
          game.input.trigger(key, game.input.ENGAGE);
          game.input.trigger(key, game.input.RELEASE);
      });
    }

    this.toggle = function toggle(keys, state) {
      keys.split(' ').forEach(key => {
        game.input.enable();
        game.input.trigger(key, state ? game.input.ENGAGE : game.input.RELEASE);
      });
    }

    this.wait = function wait(seconds) {
      return game.scene.waitFor(seconds);
    }

    this.waitUntil = function wait(check) {
      return new Engine.SyncPromise(resolve => {
        debugger;
        const world = game.scene.world;
        while(!check()) {
          world.simulateTime(world._timeStep);
        }
        resolve();
      });
    }

    this.game = game;
    this.loader = loader;

    this.element = document.querySelector('#screen');
    this.game.attachToElement(this.element);
    this.game.setResolution(640, 480);
    this.game.adjustResolution();
  }
  destroy()
  {
    this.element.innerHTML = '';
  }
}
