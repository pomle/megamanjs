class TestEnv
{
  constructor()
  {
    this._currentTime = 0;

    this.game = new Game;
    this.loader = new Game.Loader.XML(this.game);

    this._screen = document.querySelector('#screen');

    this.game.attachToElement(this._screen);
    this.game.setResolution(640, 480);
    this.game.adjustResolution();
  }
  destroy()
  {
    this._screen.innerHTML = '';
  }
  do(seconds, callback) {
    return this.game.scene.doFor(seconds, callback);
  }
  load(scene) {
    const method = scene.indexOf('.xml') === -1 ? 'loadSceneByName' : 'loadScene';
    return this.loader[method](scene)
      .then(scene => {
        scene.camera.smoothing = 0;
        this.game.setScene(scene);
        return scene;
      });
  }
  scene(scene) {
    this.game.setScene(scene);
  }
  tap(keys) {
    const inp = this.game.input;
    inp.enable();
    keys.split(' ').forEach(key => {
        inp.trigger(key, inp.ENGAGE);
        inp.trigger(key, inp.RELEASE);
    });
  }
  time(add) {
    const timer = this.game.scene.timer;
    timer.eventLoop(this._currentTime);
    timer.eventLoop(this._currentTime += add * 1000);
  }
  toggle(keys, state) {
    const inp = this.game.input;
    inp.enable();
    keys.split(' ').forEach(key => {
      inp.trigger(key, state ? inp.ENGAGE : inp.RELEASE);
    });
  }
  useInput(url) {
    return fetch(url)
      .then(response => response.json())
      .then(log => {
        this.game.input.enable();
        const player = new Engine.InputPlayer(this.game.scene.world,
                                            this.game.input);
        player.play(log);
        return player;
      });
  }
  wait(seconds) {
    return this.game.scene.waitFor(seconds);
  }
}
