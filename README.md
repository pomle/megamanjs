# megamanjs
[![Build Status](https://travis-ci.org/pomle/megamanjs.svg?branch=master)][1]
[![codecov.io](https://codecov.io/github/pomle/megamanjs/coverage.svg?branch=master)](https://codecov.io/github/pomle/megamanjs?branch=master)

Project that aims at creating a game engine in JavaScript using Megaman 2 on NES as guide. WebGL is used as renderer and despite Megaman 2 being a 2D game it is run in 3D space using [THREE.js](https://github.com/mrdoob/three.js/) as 3D lib.

Deployed at http://megaman.pomle.com/

This project have generated the SnakeSilk Game Engine and the following libraries:
* [snakesilk-engine](https://github.com/snakesilk/snakesilk-engine)
  Simple game engine providing game Entity, Timer, Scene, etc.

* [snakesilk-xml-loader](https://github.com/snakesilk/snakesilk-xml-loader)
  Loader creating entities and scenes from XML.

* [megaman-kit](https://github.com/snakesilk/megaman-kit)
  Components for creating Megaman games.

Follow the project blog at https://medium.com/recreating-megaman-2-using-js-webgl

## Running

* Clone repo.

        git clone https://github.com/pomle/megamanjs.git
        cd megamanjs

* Install dependencies

        yarn install

* Start; should open game in a browser.

        yarn start


## Developing

### Prerequisites

* Make sure you are running Node.js `>= 7`. Installation instructions for your platform can be found at https://nodejs.org/en/download/package-manager/.

        node --version

* Install dev dependencies.

        cd megamanjs
        yarn install

* Run test suite.

        yarn test

    The test suite begins with running a Mocha unit test in Node. After that a Chrome window should open and run a browser test.


## Contributing

Contributions are welcome.

[1]: https://travis-ci.org/pomle/megamanjs
