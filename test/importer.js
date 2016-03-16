var fs = require('fs');
var files = require('../script_order.json');

var BASE_PATH = __dirname + '/../src/';

var js = '';
files.forEach(function(src) {
    js += fs.readFileSync(BASE_PATH + src);
});

var $ = require('../src/lib/jquery-2.1.3.min.js');
var THREE = require('three');
eval(js);

module.exports = {
    THREE: THREE,
    Engine: Engine,
    Game: Game,
};
