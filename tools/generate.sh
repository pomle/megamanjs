#! /usr/bin/env bash
set -e

node ./tools/generate-dev-html.js > ./src/dev.html
node ./tools/generate-browser-test-html.js "test/integration/tests" > ./test/integration/index.html
node ./tools/generate-browser-test-html.js "test/system/tests" > ./test/system/index.html
