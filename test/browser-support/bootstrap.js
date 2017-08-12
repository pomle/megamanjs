mocha.setup({
  ui: 'bdd',
  enableTimeouts: false,
});

const env = new TestEnv('/public/resource/Megaman2.xml');
env.renderInterval = 0;
env.tickDelay = -1;
