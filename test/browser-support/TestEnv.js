class TestEnv
{
  constructor(gameXML)
  {
    this.renderInterval = 0;
    this.tickDelay = -1;

    this.paused = false;
    this._resume = null;

    this._running = false;
    this._screen = document.querySelector('#screen');

    this.game = new Engine.Game;
    this.loader = new Engine.XMLLoader(this.game);

    if (this._screen) {
      this.game.attachToElement(this._screen);
      this.game.setResolution(640, 480);
      this.game.adjustResolution();
    }
    this.ready = this.loader.loadGame(gameXML);
  }
  destroy()
  {
    this.game.destroy();
    this._screen.innerHTML = '';
  }
  load(scene)
  {
    const method = scene.indexOf('.xml') === -1 ? 'loadSceneByName' : 'loadScene';
    return this.loader[method](scene).then(scene => {
      scene.camera.smoothing = 0;
      return scene;
    });
  }
  loadInput(url)
  {
    return fetch(url).then(response => response.json());
  }
  pauseToggle()
  {
    if (this.paused) {
      this.paused = false;
      if (this._resume) {
        this._resume();
      }
    } else {
      this.paused = true;
    }
  }
  scene(scene)
  {
    this.game.setScene(scene);
  }
  tap(keys)
  {
    const inp = this.game.input;
    inp.enable();
    keys.split(' ').forEach(key => {
        inp.trigger(key, inp.ENGAGE);
        inp.trigger(key, inp.RELEASE);
    });
  }
  toggle(keys, state)
  {
    const inp = this.game.input;
    inp.enable();
    keys.split(' ').forEach(key => {
      inp.trigger(key, state ? inp.ENGAGE : inp.RELEASE);
    });
  }
  release()
  {
    this.game.input.release();
  }
  settle()
  {
    this.game.scene.world.simulateTime(0);
  }
  playInput(log)
  {
    this.game.input.enable();
    const player = new Engine.InputPlayer(this.game.scene.world,
                                          this.game.input);
    player.play(log);
    return player;
  }
  goToTick(tick)
  {
    /* When the game is paused and the tick retrieved
       current tick is returned but the simulation event
       for that tick will happen on the next iteration. */
    const goal = (tick - 1) | 0;
    return this.waitUntil(data => data.tick === goal);
  }
  goToTime(time)
  {
    return this.waitUntil(data => data.totalTime > time);
  }
  waitTicks(ticks)
  {
    const tick = this.game.scene.world._tick + ticks;
    return this.waitUntil(data => data.tick >= tick);
  }
  waitTime(time)
  {
    const goal = this.game.scene.world._timeTotal + time;
    return this.waitUntil(data => data.totalTime >= goal);
  }
  waitUntil(condition)
  {
    if (this._running) {
      throw new Error('Progress already running. Make sure last wait*() call was waiting to be resolved.');
    }
    this._running = true;

    return new Promise(resolve => {
      const scene = this.game.scene;
      const world = scene.world;

      const simCallback = (dt, t, tick) => {
        if (this.renderInterval > 0 && tick % this.renderInterval === 0) {
          this.game.render();
        }

        const data = {
          scene,
          world,
          tick,
          deltaTime: dt,
          totalTime: t,
        };

        if (condition(data)) {
          world.events.unbind(world.EVENT_SIMULATE, simCallback);
          this._running = false;
          this._resume = null;
          resolve();
        }
      };

      world.events.bind(world.EVENT_SIMULATE, simCallback);

      const next = this._resume = () => {
        if (!this.paused) {
          if (this.tickDelay >= 0) {
            scene._timerUpdate(scene.world.timeStep);
          } else {
            /* Relieve occasionally to let Async operations run.
               In the game environment everything is sync, but
               the loader is async when loading resources so in
               order to be able to test that a level is loaded
               at some time, we need to back off. */
            let maxTicks = 1200;
            while (maxTicks-- && this._running) {
              scene._timerUpdate(scene.world.timeStep);
            }
          }

          if (this._running) {
            setTimeout(next, this.tickDelay);
          }
        }
      };

      next();
    });
  }
}
