describe('Intro', function() {
  before(function(done) {
    env.load('Intro').then(scene => {
      env.scene(scene);
      done();
    });
  });

  after(function() {
    env.game.unsetScene();
  });

  it('should have an invisible logo', function() {
    const logo = env.game.scene.world.getObject('logo');
    expect(logo.model.material.opacity).to.be(0);
    expect(logo.position.z).to.be(-800);
  });

  it('should have three invisible text layers', function() {
    env.game.render();
    const world = env.game.scene.world;
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

  it('layer 1 should be visible after 2.5 seconds', function(done) {
    env.goToTick(300).then(() => {
      expect(this.objects[0].model.material.opacity).to.be(1);
      expect(this.objects[1].model.material.opacity).to.be(0);
      done();
    });
  });

  it('layer 2 should be visible after 8 seconds', function(done) {
    env.goToTick(1260).then(() => {
      expect(this.objects[0].model.material.opacity).to.be(0);
      expect(this.objects[1].model.material.opacity).to.be(1);
      done();
    });
  });

  it('layer 3 should be visible after 8 seconds', function(done) {
    env.goToTick(2220).then(() => {
      expect(this.objects[1].model.material.opacity).to.be(0);
      expect(this.objects[2].model.material.opacity).to.be(1);
      done();
    });
  });

  it('layer 3 should be hidden after 5 seconds', function(done) {
    env.goToTick(2820).then(() => {
      expect(this.objects[2].model.material.opacity).to.be(0);
      done();
    });
  });

  it('camera should be scrolled after 12 seconds', function(done) {
    env.goToTick(4260).then(() => {
      expect(env.game.scene.camera.position.y).to.be.within(400, 500);
      done();
    });
  });

  it('camera should reach top of skyscraper', function(done) {
    env.goToTick(4500).then(() => {
      expect(env.game.scene.camera.position.y).to.be.within(570, 580);
      done();
    });
  });

  it('logo should still be invisible', function() {
    const logo = env.game.scene.world.getObject('logo');
    expect(logo.model.material.opacity).to.be(0);
    expect(logo.position.z).to.be(-800);
  });

  it('logotype should be revealed', function(done) {
    env.goToTick(4800).then(() => {
      const logo = env.game.scene.world.getObject('logo');
      expect(logo.model.material.opacity).to.be(1);
      expect(logo.position.z).to.be(0);
      done();
    });
  });

  it('should go to scene select when pressing start', function(done) {
    env.game.events.once(env.game.EVENT_SCENE_SET, scene => {
      done();
    });
    env.tap('start');
  });
});
