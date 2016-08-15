['tickDelay', 'renderInterval'].forEach(prop => {
    const element = document.querySelector('[name=' + prop + ']');
    let value;
    if (value = localStorage.getItem(prop)) {
        element.value = value;
    } else {
        value = element.value;
    }

    if (env.hasOwnProperty(prop)) {
        env[prop] = value|0;
    }
});

document.addEventListener('click', e => {
  const name = e.target.getAttribute('name');
  if (name === 'pauseToggle') {
     env.pauseToggle();
  } else if (name === 'exposeTick') {
    if (env.game.scene) {
      console.info('Tick', env.game.scene.world._tick);
    } else {
      console.error('No active scene');
    }
  }
});

document.addEventListener('change', e => {
    if (e.target.matches('[name=tickDelay]')) {
        env.tickDelay = e.target.value|0;
        localStorage.setItem('tickDelay', e.target.value);
    } else if (e.target.matches('[name=renderInterval]')) {
        env.renderInterval = e.target.value|0;
        localStorage.setItem('renderInterval', e.target.value);
    }
});
