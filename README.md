# megamanjs
[![Build Status](https://travis-ci.org/pomle/megamanjs.svg?branch=master)][1]
[![codecov.io](https://codecov.io/github/pomle/megamanjs/coverage.svg?branch=master)](https://codecov.io/github/pomle/megamanjs?branch=master)

Project that aims at remaking Megaman 2 in JavaScript using WebGL as renderer. 

Follow the project blog at https://medium.com/recreating-megaman-2-using-js-webgl

See the v0.1 demo video: https://www.youtube.com/watch?v=LQHTdmzcV3E (lagging introduced by screen capture).

## Developing

1) Clone repo.

    git clone https://github.com/pomle/megamanjs.git

2) Start a webserver of your choice in project dir, for example:

    cd megamanjs
    php -S localhost:8000 -t ./
or

    cd megamanjs
    python -m SimpleHTTPServer 8000
  
3) Browse to dev version at `http://localhost:8000/src/dev.html` and it should run.

4) When adding scripts to project, add them to [script-manifest.json](https://github.com/pomle/megamanjs/blob/master/src/script-manifest.json) and regenerate `dev.html`.

    npm run generate-dev


####Running locally in Chrome

To run project locally without a web server, Chrome needs to be started with --allow-file-access-from-files flag.

Windows:

    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files

OSX

    open -a "Google Chrome" --args --allow-file-access-from-files
    
## Contributing

Contributions are welcome.

[1]: https://travis-ci.org/pomle/megamanjs
