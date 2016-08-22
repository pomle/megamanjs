# megamanjs
[![Build Status](https://travis-ci.org/pomle/megamanjs.svg?branch=master)][1]
[![codecov.io](https://codecov.io/github/pomle/megamanjs/coverage.svg?branch=master)](https://codecov.io/github/pomle/megamanjs?branch=master)
[![code-climate](https://codeclimate.com/github/pomle/megamanjs/badges/gpa.svg)](https://codeclimate.com/github/pomle/megamanjs)

Project that aims at creating a game engine in JavaScript using Megaman 2 on NES as MVP guide. WebGL is used as renderer and despite Megaman 2 being a 2D game it is run in 3D space using [THREE.js](https://github.com/mrdoob/three.js/) as 3D lib.

Follow the project blog at https://medium.com/recreating-megaman-2-using-js-webgl

## Running

* Clone repo.

        git clone https://github.com/pomle/megamanjs.git

* Start webserver of your choice in project dir.

        cd megamanjs
        php -S localhost:8000 -t ./
        
   or

        cd megamanjs
        python -m SimpleHTTPServer 8000
  
* Open `http://localhost:8000/src/dev.html` in Chrome and it should run.


## Developing

### Prerequisites

* Make sure you are running Node.js `>= 6`. Installation instructions for your platform can be found at https://nodejs.org/en/download/package-manager/.

        node --version

* Install dev dependencies.

        cd megamanjs
        npm install

* Run test suite.

        npm test

    The test suite begins with running a Mocha unit test in Node. After that a Chrome window should open running an integration test followed by a system test. Lastly test coverage output is stored in `./test/coverage`.

* When adding scripts to project, add them to [`script-manifest.json`](https://github.com/pomle/megamanjs/blob/master/src/script-manifest.json) and regenerate.

        npm run generate


####Running locally in Chrome without web server (discouraged).

To run project locally without a web server, Chrome needs to be started with `--allow-file-access-from-files` flag.

* Windows

        "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files

* OSX

        open -a "Google Chrome" --args --allow-file-access-from-files
    
## Contributing

Contributions are welcome.

[1]: https://travis-ci.org/pomle/megamanjs
