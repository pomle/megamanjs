mocha.setup({
  ui: 'bdd',
  enableTimeouts: false,
});

const env = new TestEnv('/dist/resource/Megaman2.xml');
env.renderInterval = 0;
env.tickDelay = -1;
