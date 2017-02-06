#! /usr/bin/env node

'use strict';

const injectCSS = require('./lib/inject').injectCSS;
const injectJS = require('./lib/inject').injectJS;

const fs = require('fs');

let template = fs.readFileSync(__dirname + '/template.html', 'utf8');

const styles = ['main.css', 'dev.css'];
template = injectCSS('<!-- INJECT-CSS -->', template, styles);

const engineScripts = require('../src/engine/script-manifest.json').map(src => './engine/src/' + src);
const megamanScripts = require('../src/script-manifest.json').map(src => './scripts/' + src);

const scripts = [];
scripts.push(...engineScripts);
scripts.push(...megamanScripts);
scripts.unshift('./engine/lib/three.js');
scripts.push('main.js', 'dev.js');
template = injectJS('<!-- INJECT-JS -->', template, scripts);

process.stdout.write(template);
