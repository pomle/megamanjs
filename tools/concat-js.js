'use strict';

const vm = require('vm');
const fs = require('fs');
const scripts = require('../src/script-manifest.json');

let js = '';
scripts.forEach((src) => {
  js += fs.readFileSync(__dirname + '/../src/' + src, 'utf8') + '\n';
});

global.THREE = require('three');
vm.runInThisContext(js);

process.stdout.write(js);
