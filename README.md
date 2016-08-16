# megamanjs
[![Build Status](https://travis-ci.org/pomle/megamanjs.svg?branch=master)][1]
[![codecov.io](https://codecov.io/github/pomle/megamanjs/coverage.svg?branch=master)](https://codecov.io/github/pomle/megamanjs?branch=master)

Project that aims at remaking Megaman 2 in JavaScript using WebGL as renderer. 

Follow the project blog at https://medium.com/recreating-megaman-2-using-js-webgl

See the v0.1 demo video: https://www.youtube.com/watch?v=LQHTdmzcV3E (lagging introduced by screen capture).

## Running

Clone repo.

    git clone https://github.com/pomle/megamanjs.git

Start a webserver of your choice in project dir, for example:

    cd megamanjs
    php -S localhost:8000 -t ./
or

    cd megamanjs
    python -m SimpleHTTPServer 8000
  
Browse to dev version at `http://localhost:8000/src/dev.html` and it should run.


## Developing

### Prerequisites

Install dev dependencies with

        cd megamanjs
        npm install

### Testing

#### Unit Tests

Unit tests are run in Node using Mocha.

        npm run test:unit

#### Integration Tests

Integration / System tests are automaticly run in Chrome using Karma Runner and Mocha

        npm run test:integration

When adding scripts to project, add them to [script-manifest.json](https://github.com/pomle/megamanjs/blob/master/src/script-manifest.json) and regenerate .

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
