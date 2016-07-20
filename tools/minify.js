#! /usr/bin/env node
const babel = require('babel-core');
const uglify = require('uglify-js');
const fs = require('fs');

const files = process.argv.slice(2);

let code = '';
files.forEach(file => {
  code += fs.readFileSync(file, 'UTF-8');
});

code = babel.transform(code, {
  presets: ["es2015"],
  comments: false,
  minified: true,
}).code;

code = uglify.minify(code, {
    fromString: true,
    mangle: true,
    compress: {
        dead_code: true,
    }
}).code;

process.stdout.write(code);
