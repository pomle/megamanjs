/**
 * Script for require-ifying src files for use in tests.
 */

'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const BASE_PATH = path.resolve(path.join(__dirname, '..', 'src'));

const files = require('../src/script-manifest.json');

global.THREE = require('three');

files.forEach(src => {
  const filename = path.join(BASE_PATH, src);
  const code = fs.readFileSync(filename, 'utf8');

  try {
    vm.runInThisContext(code, filename);
  } catch (e) {
    console.error('Error while running', filename);
    throw e;
  }
});

module.exports = {
    THREE,
    Engine,
};
