const THREE = require('three');
const Engine = require('@snakesilk/engine');
const {createLoader} = require('../src/bootstrap');

window.THREE = THREE;
window.Engine = Engine;
window.createLoader = createLoader;
