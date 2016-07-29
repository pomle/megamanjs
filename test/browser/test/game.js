'use strict';

describe('Megaman 2', function() {
  before(function() {
    this.env = new TestEnv;
  });

  after(function() {
    this.env.destroy();
  });

  it('should load game with entrypoint Intro', function(done) {
    this.env.loader.loadGame('../../../src/resource/Megaman2.xml').then(entrypoint => {
      expect(entrypoint).to.be('Intro');
      done();
    });
  });

  it('should load a scene by name', function(done) {
    this.env.loader.loadSceneByName('Intro').then(scene => {
      this.env.game.setScene(scene);
      done();
    });
  });
});
