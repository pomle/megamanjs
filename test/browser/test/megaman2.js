'use strict';

describe('Megaman 2', function() {
  before(function() {
    const game = new Game;
    const loader = new Game.Loader.XML(game);

    let currentTime = 0;
    this.time = function time(add) {
      game.scene.timer.eventLoop(currentTime);
      game.scene.timer.eventLoop(currentTime += add * 1000);
    }

    this.touch = function touch(keys) {
      keys.split(' ').forEach(key => {
          game.input.enable();
          game.input.trigger(key, game.input.ENGAGE);
          game.input.trigger(key, game.input.RELEASE);
      });
    }

    this.wait = function wait(seconds) {
      return game.scene.waitFor(seconds);
    }

    this.game = game;
    this.loader = loader;
  });

  /*afterEach(function(done) {
    setTimeout(done, 100);
  });*/

  it('should load game intro intro', function(done) {
    const screen = document.querySelector('#screen');
    this.game.attachToElement(screen);
    this.game.setResolution(640, 480);
    this.game.adjustResolution();

    this.loader.loadGame('../../../src/resource/Megaman2.xml').then(entrypoint => {
      return this.loader.loadSceneByName(entrypoint);
    }).then(scene => {
      this.game.setScene(scene);
      done();
    });
  });

  it('should have an invisible logo', function() {
    const logo = this.game.scene.world.getObject('logo');
    expect(logo.model.material.opacity).to.be(0);
    expect(logo.position.z).to.be(-800);
  });

  it('should have three invisible text layers', function() {
    this.game.render();
    const world = this.game.scene.world;
    const objects = [
      world.getObject('story1'),
      world.getObject('story2'),
      world.getObject('story3'),
    ];

    objects.forEach(o => {
      expect(o).to.be.an(Engine.Object);
      expect(o.model.material.opacity).to.be(0);
    });

    this.objects = objects;
  });

  it('layer 1 should be visible after 2.5 seconds', function() {
    this.time(2.5);
    this.game.render();
    expect(this.objects[0].model.material.opacity).to.be(1);
    expect(this.objects[1].model.material.opacity).to.be(0);
  });

  it('layer 2 should be visible after 8 seconds', function() {
    this.time(8);
    this.game.render();
    expect(this.objects[0].model.material.opacity).to.be(0);
    expect(this.objects[1].model.material.opacity).to.be(1);
  });

  it('layer 3 should be visible after 8 seconds', function() {
    this.time(8);
    this.game.render();
    expect(this.objects[1].model.material.opacity).to.be(0);
    expect(this.objects[2].model.material.opacity).to.be(1);
  });

  it('layer 3 should be hidden after 5 seconds', function() {
    this.time(5);
    this.game.render();
    expect(this.objects[2].model.material.opacity).to.be(0);
  });

  it('camera should be scrolled after 10 seconds', function() {
    this.time(10);
    this.game.render();
    expect(this.game.scene.camera.position.y).to.be.within(400, 500);
  });

  it('camera should reach top of skyscraper', function() {
    this.time(10);
    this.game.render();
    expect(this.game.scene.camera.position.y).to.be.within(570, 580);
  });

  it('logotype should be displayed', function() {
    this.time(3);
    this.game.render();
    const logo = this.game.scene.world.getObject('logo');
    expect(logo.model.material.opacity).to.be(1);
    expect(logo.position.z).to.be(0);
  });

  it('should go to scene select when pressing start', function(done) {
    this.game.events.once(this.game.EVENT_SCENE_SET, scene => {
      done();
    });
    this.touch('start');
  });

  it('scene select should start zoomed in and then zoom out', function() {
    this.game.render();
    expect(this.game.scene.camera.position.z).to.be(40);
    this.time(1);
    this.game.render();
    expect(this.game.scene.camera.position.z).to.be(140);
  });

  it('should select Heatman stage when pressing left and start', function(done) {
    const scene = this.game.scene;
    scene.events.once(scene.EVENT_STAGE_SELECTED, stage => {
      expect(stage.character).to.be(this.loader.resourceManager.get('object', 'Heatman'));
      done();
    });
    this.touch('left start');
  });

  it('camera should move to reveal screen', function() {
    this.time(3);
    this.game.render();
    expect(this.game.scene.camera.position.y).to.be(440);
  });

  it('should load Heatman level', function(done) {
    this.game.events.once(this.game.EVENT_SCENE_SET, scene => {
      expect(scene).to.be.a(Game.scenes.Level);
      done();
    });
    this.time(8);
  });

  it('should start Megaman at the right spot', function() {
    this.time(3);
    this.game.render();
    expect(this.game.player.character.position).to.eql({x: 136, y: -165, z: 0});
  });
});
