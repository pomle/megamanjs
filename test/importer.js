/**
 * Script for require-ifying src files for use in tests.
 */

var fs = require('fs');
var files = require('../src/script-manifest.json');

var BASE_PATH = __dirname + '/../src/';

var $ = require('../src/lib/jquery-2.1.3.js');
var THREE = require('three');

for (var i = 0; i < files.length; ++i) {
    var src = BASE_PATH + files[i];

    // Catch syntax error with line number.
    try {
        require(src);
    } catch (e) {
        if (e instanceof SyntaxError) {
            throw e;
        }
    }

    var code = fs.readFileSync(src, 'utf8');
    eval(code);
}

module.exports = {
    THREE: THREE,
    Engine: Engine,
    Game: Game,
};
