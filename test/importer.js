'use strict';
/**
 * Script for require-ifying src files for use in tests.
 */

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const BASE_PATH = path.resolve(path.join(__dirname, '..', 'src'));

const files = require('../src/script-manifest.json');

global.$ = require('../src/lib/jquery-2.1.3.js');
global.THREE = require('three');

files.forEach((rel) => {
  let src = path.join(BASE_PATH, rel);
  let code = fs.readFileSync(src, 'utf8');
  vm.runInThisContext(code, {filename: src});
});

module.exports = {
    THREE: THREE,
    Engine: Engine,
    Game: Game,
};
