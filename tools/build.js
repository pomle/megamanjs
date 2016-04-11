'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const syntax = require('syntax-error');
const scripts = require('../src/script-manifest.json');

function mkdir(path) {
  try {
    fs.accessSync(path, fs.F_OK);
  } catch (e) {
    fs.mkdirSync(path);
  }
}

const match = {
  comment: /\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm,
};

function minifyJS(buffer) {
  buffer = buffer.replace(match.comment, '');
  buffer = buffer.replace(/^.*use strict.*$/mg, '');
  buffer = buffer.replace(/\n}\n/g, '};');
  buffer = buffer.replace(/^\s+/mg, '');
  return "'use strict';\n" + buffer;
}

const BUILD_DIR = path.resolve(__dirname, '../build');
const SRC_DIR = path.resolve(__dirname, '../src');

console.log(BUILD_DIR, SRC_DIR);

let js = '';

scripts.forEach((src) => {
  js += fs.readFileSync(SRC_DIR + '/' + src, 'utf8') + "\n";
});


js = minifyJS(js);

global.THREE = require('THREE');
const err = syntax(js, 'bundle');
if (err) {
  console.log('Syntax error at %d:%d', err.line, err.column);
  console.log(js.substr(err.column - 50, 100));
  console.log(Array(50).join(' ') + '^');
}

fs.writeFileSync(BUILD_DIR + '/mintest.js', js);

/*



html = htmlMinify(html, {
  collapseWhitespace: true,
  minifyCSS: true,
  minifyJS: true,
});

fs.writeFileSync(BUILD_DIR + '/index.html', html);*/