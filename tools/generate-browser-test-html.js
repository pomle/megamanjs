#! /usr/bin/env node

'use strict';

const injectJS = require('./lib/inject').injectJS;

const fs = require('fs');

let template = fs.readFileSync(__dirname + '/browser-test-template.html', 'utf8');

const scripts = require('../src/script-manifest.json').map(src => '../../src/' + src);
scripts.unshift('../../src/lib/three.js');
template = injectJS('<!-- INJECT-JS-DEPS -->', template, scripts);

process.stdout.write(template);
