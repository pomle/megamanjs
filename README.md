# megamanjs
[![Build Status](https://travis-ci.org/pomle/megamanjs.svg?branch=master)][1]
[![codecov.io](https://codecov.io/github/pomle/megamanjs/coverage.svg?branch=master)](https://codecov.io/github/pomle/megamanjs?branch=master)
[![code-climate](https://codeclimate.com/github/pomle/megamanjs/badges/gpa.svg)](https://codeclimate.com/github/pomle/megamanjs)

Project that aims at remaking Megaman 2 in JavaScript using WebGL as renderer. 

Follow the project blog at https://medium.com/recreating-megaman-2-using-js-webgl

See the v0.1 demo video: https://www.youtube.com/watch?v=LQHTdmzcV3E (lagging introduced by screen capture).

## Running

* Clone repo.

        git clone https://github.com/pomle/megamanjs.git

* Start a webserver of your choice in project dir, for example:

        cd megamanjs
        php -S localhost:8000 -t ./
        
   or

        cd megamanjs
        python -m SimpleHTTPServer 8000
  
* Browse to dev version at `http://localhost:8000/src/dev.html` and it should run.


## Developing

### Prerequisites

* Make sure you are running Node.js >= 6

* Install dev dependencies with

        cd megamanjs
        npm install

* Run test suite

        npm test

The test suite begins with running a Mocha unit test in Node. After that Karma starts and should open a Chrome window where an integration test followed by a system test is run. Lastly test coverage output is stored in ./test/coverage.

* When adding scripts to project, add them to [script-manifest.json](https://github.com/pomle/megamanjs/blob/master/src/script-manifest.json) and regenerate .

        npm run generate


####Running locally in Chrome without web server (discouraged).

To run project locally without a web server, Chrome needs to be started with --allow-file-access-from-files flag.

Windows:

        "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files

OSX

        open -a "Google Chrome" --args --allow-file-access-from-files
    
## Contributing

Contributions are welcome.

[1]: https://travis-ci.org/pomle/megamanjs
