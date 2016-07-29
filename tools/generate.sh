#! /usr/bin/env bash
set -e

node ./tools/generate-dev-html.js > ./src/dev.html
node ./tools/generate-browser-test-html.js > ./test/browser/index.html
