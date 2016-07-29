'use strict';

describe('Intro', function() {
  before(function(done) {
    this.env = new TestEnv;
    this.env.loader.loadGame('../../../src/resource/Megaman2.xml').then(() => {
      return this.env.loader.loadSceneByName('Intro');
    }).then(scene => {
      this.env.game.setScene(scene);
      done();
    });
  });

  after(function() {
    this.env.destroy();
  });

  it('should have an invisible logo', function() {
    const logo = this.env.game.scene.world.getObject('logo');
    expect(logo.model.material.opacity).to.be(0);
    expect(logo.position.z).to.be(-800);
  });

  it('should have three invisible text layers', function() {
    this.env.game.render();
    const world = this.env.game.scene.world;
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
    this.env.time(2.5);
    this.env.game.render();
    expect(this.objects[0].model.material.opacity).to.be(1);
    expect(this.objects[1].model.material.opacity).to.be(0);
  });

  it('layer 2 should be visible after 8 seconds', function() {
    this.env.time(8);
    this.env.game.render();
    expect(this.objects[0].model.material.opacity).to.be(0);
    expect(this.objects[1].model.material.opacity).to.be(1);
  });

  it('layer 3 should be visible after 8 seconds', function() {
    this.env.time(8);
    this.env.game.render();
    expect(this.objects[1].model.material.opacity).to.be(0);
    expect(this.objects[2].model.material.opacity).to.be(1);
  });

  it('layer 3 should be hidden after 5 seconds', function() {
    this.env.time(5);
    this.env.game.render();
    expect(this.objects[2].model.material.opacity).to.be(0);
  });

  it('camera should be scrolled after 10 seconds', function() {
    this.env.time(10);
    this.env.game.render();
    expect(this.env.game.scene.camera.position.y).to.be.within(400, 500);
  });

  it('camera should reach top of skyscraper', function() {
    this.env.time(10);
    this.env.game.render();
    expect(this.env.game.scene.camera.position.y).to.be.within(570, 580);
  });

  it('logo should still be invisible', function() {
    const logo = this.env.game.scene.world.getObject('logo');
    expect(logo.model.material.opacity).to.be(0);
    expect(logo.position.z).to.be(-800);
  });

  it('logotype should be revealed', function() {
    this.env.time(3);
    this.env.game.render();
    const logo = this.env.game.scene.world.getObject('logo');
    expect(logo.model.material.opacity).to.be(1);
    expect(logo.position.z).to.be(0);
  });

  it('should go to scene select when pressing start', function(done) {
    this.env.game.events.once(this.env.game.EVENT_SCENE_SET, scene => {
      done();
    });
    this.env.tap('start');
  });
});
