'use strict';

describe('Heatman Level', function() {
  before(function(done) {
    this.env = new TestEnv;
    const game = this.env.game;
    const load = this.env.loader;

    load.loadGame('../../../src/resource/Megaman2.xml')
      .then(() => load.loadSceneByName('Heatman'))
      .then(scene => {
        scene.camera.smoothing = 0;
        game.setScene(scene);
        done();
      });
  });

  after(function() {
    this.env.destroy();
  });

  it('should hide player off screen on start', function() {
    expect(this.env.game.player.character.position.y)
      .to.be.above(this.env.game.scene.camera.position.y + 120);
  });

  it('should blink ready text', function() {
    this.text = this.env.game.scene.assets['start-caption'];
    this.env.time(3/60);
    expect(this.env.game.scene.world.scene.children)
      .to.contain(this.text);
    expect(this.text.visible).to.be(true);
    this.env.time(9/60);
    expect(this.text.visible).to.be(false);
    this.env.time(9/60);
    this.env.game.render();
    expect(this.text.visible).to.be(true);
  });

  it('should remove ready text', function() {
    this.env.time(100/60);
    expect(this.env.game.scene.world.scene.children)
      .to.not.contain(this.text);
    delete this.text;
  });

  it('should have teleported player to first checkpoint', function() {
    this.env.time(.6);
    this.env.game.render();
    expect(this.env.game.player.character.position)
      .to.eql({x: 136, y: -165, z: 0});
  });

  it.skip('disappearing blocks part 1 should be solvable', function(done) {
  });

  it.skip('disappearing blocks part 2 should be solvable', function(done) {
  });
});
