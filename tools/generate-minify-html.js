#! /usr/bin/env node

'use strict';

const injectCSS = require('./lib/inject').injectCSS;
const injectJS = require('./lib/inject').injectJS;

const fs = require('fs');

let template = fs.readFileSync(__dirname + '/template.html', 'utf8');

const styles = ['main.css'];
template = injectCSS('<!-- INJECT-CSS -->', template, styles);

const scripts = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r70/three.min.js',
  'megaman.min.js',
];
template = injectJS('<!-- INJECT-JS -->', template, scripts);

process.stdout.write(template);
