#! /usr/bin/env node
'use strict';

const exec = require('child_process').exec;
const fs = require('fs');
const inject = require('./lib/inject').inject;

function getDepScripts() {
  const scripts = require('../src/engine/script-manifest.json').map(src => '../../src/engine/src/' + src);
  scripts.unshift('../../src/engine/lib/three.js');
  return Promise.resolve(scripts);
}

function getTestFiles(path) {
  const command = 'ls ' + path;
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        const files = stdout.split('\n')
          .filter(item => item.length)
          .map(item => './tests/' + item);
        resolve(files);
      }
    });
  });
}

function getTestTemplate() {
  return new Promise((resolve, reject) => {
    fs.readFile(__dirname + '/browser-test-template.html', 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

Promise.all([
  getTestTemplate(),
  getTestFiles(process.argv[2]),
  getDepScripts(),
]).then(([template, tests, deps]) => {
  template = inject('<!-- INJECT-JS-DEPS -->', template,
    deps.map(src => '<script src="' + src + '"></script>'));

  template = inject('<!-- INJECT-TEST-SCRIPTS -->', template,
    tests.map(src => '<script src="' + src + '"></script>'));

  process.stdout.write(template);
}).catch(err => {
  console.error(err);
})
