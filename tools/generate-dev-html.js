#! /usr/bin/env node

'use strict';

const injectCSS = require('./lib/inject').injectCSS;
const injectJS = require('./lib/inject').injectJS;

const fs = require('fs');

let template = fs.readFileSync(__dirname + '/template.html', 'utf8');

const styles = ['main.css'];
template = injectCSS('<!-- INJECT-CSS -->', template, styles);

const scripts = require('../src/script-manifest.json');
scripts.unshift('lib/three.js');
scripts.push('main.js', 'dev.js');
template = injectJS('<!-- INJECT-JS -->', template, scripts);

process.stdout.write(template);
