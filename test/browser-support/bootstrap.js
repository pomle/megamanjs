mocha.setup({
  ui: 'bdd',
  enableTimeouts: false,
});

const env = new TestEnv('./../../src/resource/Megaman2.xml');
env.renderInterval = 1;
env.tickDelay = 1;

